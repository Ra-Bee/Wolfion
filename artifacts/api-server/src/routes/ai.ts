import { promises as dns } from "node:dns";
import net from "node:net";
import { Router, type IRouter } from "express";
import { toFile } from "groq-sdk";
import { PDFParse } from "pdf-parse";
import { ensureCompatibleFormat } from "@workspace/integrations-openai-ai-server/audio";
import { groq, GROQ_CHAT_MODEL, GROQ_TRANSCRIBE_MODEL } from "../lib/groq";
import {
  AiChatBody,
  AiChatResponse,
  AiSummarizePdfBody,
  AiSummarizePdfResponse,
  AiSummarizeTextBody,
  AiSummarizeTextResponse,
  AiSummarizeUrlBody,
  AiSummarizeUrlResponse,
  AiSummarizeVideoBody,
  AiSummarizeVideoResponse,
  AiTranscribeBody,
  AiTranscribeResponse,
  AiTranslateBody,
  AiTranslateResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM_PROMPT =
  "You are a university study assistant. Be clear, concise, and structured. When summarizing, include key points and optional references if available.";

const MAX_TOKENS = 8192;

async function askAssistant(userContent: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: GROQ_CHAT_MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}

async function speechToText(
  audioBuffer: Buffer,
  format: "wav" | "mp3" | "webm" = "wav",
): Promise<string> {
  const file = await toFile(audioBuffer, `audio.${format}`);
  const response = await groq.audio.transcriptions.create({
    file,
    model: GROQ_TRANSCRIBE_MODEL,
  });
  return response.text;
}

interface AiErrorShape {
  status?: number;
  code?: string;
  error?: { code?: string; message?: string };
}

function aiErrorMessage(err: unknown, fallback: string): { status: number; message: string } {
  const e = err as AiErrorShape;
  const code = e?.code ?? e?.error?.code;
  if (e?.status === 401 || code === "invalid_api_key") {
    return {
      status: 502,
      message:
        "Groq rejected the API key. Update GROQ_API_KEY in Replit Secrets with a valid key.",
    };
  }
  if (code === "insufficient_quota") {
    return {
      status: 502,
      message:
        "Your Groq account is out of quota. Check billing at console.groq.com and try again.",
    };
  }
  if (e?.status === 429) {
    return {
      status: 429,
      message: "Groq is rate-limiting requests. Please wait a moment and try again.",
    };
  }
  if (e?.status === 404 || code === "model_not_found" || code === "model_decommissioned") {
    return {
      status: 502,
      message:
        "The configured AI model isn't available right now. The model may have been decommissioned.",
    };
  }
  return { status: 500, message: fallback };
}

router.post("/ai/chat", async (req, res): Promise<void> => {
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const reply = await askAssistant(parsed.data.message);
    res.json(AiChatResponse.parse({ reply }));
  } catch (err) {
    req.log.error({ err }, "ai/chat failed");
    const { status, message } = aiErrorMessage(err, "Assistant is unavailable right now.");
    res.status(status).json({ error: message });
  }
});

router.post("/ai/summarize-text", async (req, res): Promise<void> => {
  const parsed = AiSummarizeTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const prompt = `Summarize the following content:
- Give the main topic
- Key bullet points
- A simple plain-language explanation
- If possible, mention references or sources

CONTENT:
${parsed.data.text}`;
  try {
    const summary = await askAssistant(prompt);
    res.json(AiSummarizeTextResponse.parse({ summary }));
  } catch (err) {
    req.log.error({ err }, "ai/summarize-text failed");
    const { status, message } = aiErrorMessage(err, "Could not summarize that text right now.");
    res.status(status).json({ error: message });
  }
});

const URL_FETCH_TIMEOUT_MS = 15000;
const MAX_FETCH_BYTES = 2_000_000;
const MAX_EXTRACTED_CHARS = 15000;
const MAX_REDIRECTS = 5;

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = Number(p);
    if (!Number.isInteger(v) || v < 0 || v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}

function isPrivateIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n == null) return true;
  const ranges: Array<[number, number]> = [
    [0x00000000, 0x00ffffff], // 0.0.0.0/8
    [0x0a000000, 0x0affffff], // 10.0.0.0/8
    [0x7f000000, 0x7fffffff], // 127.0.0.0/8
    [0xa9fe0000, 0xa9feffff], // 169.254.0.0/16 link-local
    [0xac100000, 0xac1fffff], // 172.16.0.0/12
    [0xc0a80000, 0xc0a8ffff], // 192.168.0.0/16
    [0x64400000, 0x647fffff], // 100.64.0.0/10 CGNAT
    [0xe0000000, 0xefffffff], // 224.0.0.0/4 multicast
    [0xf0000000, 0xffffffff], // 240.0.0.0/4 reserved + broadcast
  ];
  for (const [lo, hi] of ranges) {
    if (n >= lo && n <= hi) return true;
  }
  return false;
}

function expandIPv6(ip: string): number[] | null {
  let s = ip;
  if (s.includes("%")) s = s.split("%")[0]!;
  const v4 = s.lastIndexOf(":");
  let tail4: number[] | null = null;
  if (s.slice(v4 + 1).includes(".")) {
    const v4str = s.slice(v4 + 1);
    const v4parts = v4str.split(".").map((p) => Number(p));
    if (v4parts.length !== 4 || v4parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return null;
    tail4 = [(v4parts[0]! << 8) | v4parts[1]!, (v4parts[2]! << 8) | v4parts[3]!];
    s = s.slice(0, v4);
  }
  const dbl = s.split("::");
  if (dbl.length > 2) return null;
  const head = dbl[0] ? dbl[0].split(":") : [];
  const tail = dbl.length === 2 && dbl[1] ? dbl[1].split(":") : [];
  const explicitGroups = head.length + tail.length + (tail4 ? 2 : 0);
  if (explicitGroups > 8) return null;
  const fillCount = dbl.length === 2 ? 8 - explicitGroups : 0;
  const groups = [...head, ...Array(fillCount).fill("0"), ...tail];
  const nums: number[] = [];
  for (const g of groups) {
    if (g.length === 0 || g.length > 4) return null;
    const v = parseInt(g, 16);
    if (!Number.isFinite(v) || v < 0 || v > 0xffff) return null;
    nums.push(v);
  }
  if (tail4) nums.push(...tail4);
  if (nums.length !== 8) return null;
  return nums;
}

function isPrivateIPv6(ip: string): boolean {
  const g = expandIPv6(ip);
  if (!g) return true;
  // ::
  if (g.every((x) => x === 0)) return true;
  // ::1 loopback
  if (g.slice(0, 7).every((x) => x === 0) && g[7] === 1) return true;
  // ::ffff:0:0/96 IPv4-mapped — extract IPv4 and recheck
  if (g[0] === 0 && g[1] === 0 && g[2] === 0 && g[3] === 0 && g[4] === 0 && g[5] === 0xffff) {
    const v4 = `${(g[6]! >> 8) & 0xff}.${g[6]! & 0xff}.${(g[7]! >> 8) & 0xff}.${g[7]! & 0xff}`;
    return isPrivateIPv4(v4);
  }
  // fc00::/7 unique local
  if ((g[0]! & 0xfe00) === 0xfc00) return true;
  // fe80::/10 link-local
  if ((g[0]! & 0xffc0) === 0xfe80) return true;
  // ff00::/8 multicast
  if ((g[0]! & 0xff00) === 0xff00) return true;
  return false;
}

function isPrivateIP(ip: string): boolean {
  const fam = net.isIP(ip);
  if (fam === 4) return isPrivateIPv4(ip);
  if (fam === 6) return isPrivateIPv6(ip);
  return true;
}

async function assertPublicHost(hostname: string): Promise<void> {
  const host = hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    throw new Error("URL host is not reachable.");
  }
  // If literal IP, check directly; else resolve all addresses and check each.
  if (net.isIP(host)) {
    if (isPrivateIP(host)) throw new Error("URL host is not reachable.");
    return;
  }
  let addrs: { address: string; family: number }[];
  try {
    addrs = await dns.lookup(host, { all: true, verbatim: true });
  } catch {
    throw new Error("Could not resolve URL host.");
  }
  if (!addrs.length) throw new Error("Could not resolve URL host.");
  for (const a of addrs) {
    if (isPrivateIP(a.address)) throw new Error("URL host is not reachable.");
  }
}

async function readWithBudget(body: ReadableStream<Uint8Array> | null, maxBytes: number): Promise<Uint8Array> {
  if (!body) return new Uint8Array();
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        try { await reader.cancel(); } catch { /* ignore */ }
        throw new Error("RESPONSE_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    try { reader.releaseLock(); } catch { /* ignore */ }
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { out.set(c, offset); offset += c.byteLength; }
  return out;
}

async function safeFetchPage(initialUrl: string, deadlineSignal: AbortSignal): Promise<{ html: string }> {
  let currentUrl = initialUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let parsed: URL;
    try {
      parsed = new URL(currentUrl);
    } catch {
      throw new Error("Invalid URL");
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Only http and https URLs are supported.");
    }
    await assertPublicHost(parsed.hostname);

    const upstream = await fetch(parsed.toString(), {
      signal: deadlineSignal,
      redirect: "manual",
      headers: { "User-Agent": "RabChatBot/1.0 (+https://replit.com)" },
    });

    if (upstream.status >= 300 && upstream.status < 400) {
      const loc = upstream.headers.get("location");
      try { await upstream.body?.cancel(); } catch { /* ignore */ }
      if (!loc) throw new Error("Redirect with no Location header.");
      currentUrl = new URL(loc, parsed).toString();
      continue;
    }
    if (!upstream.ok) {
      try { await upstream.body?.cancel(); } catch { /* ignore */ }
      throw new Error(`Could not fetch URL (status ${upstream.status}).`);
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.includes("text/") && !contentType.includes("html") && !contentType.includes("xml")) {
      try { await upstream.body?.cancel(); } catch { /* ignore */ }
      throw new Error("URL did not return readable text content.");
    }
    const lenHeader = upstream.headers.get("content-length");
    if (lenHeader) {
      const len = Number(lenHeader);
      if (Number.isFinite(len) && len > MAX_FETCH_BYTES) {
        try { await upstream.body?.cancel(); } catch { /* ignore */ }
        throw new Error("Page too large to summarize.");
      }
    }
    const bytes = await readWithBudget(upstream.body, MAX_FETCH_BYTES);
    return { html: new TextDecoder("utf-8", { fatal: false }).decode(bytes) };
  }
  throw new Error("Too many redirects.");
}

router.post("/ai/summarize-url", async (req, res): Promise<void> => {
  const parsed = AiSummarizeUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), URL_FETCH_TIMEOUT_MS);
  let html: string;
  try {
    const out = await safeFetchPage(parsed.data.url, controller.signal);
    html = out.html;
  } catch (err) {
    clearTimeout(timer);
    const message = err instanceof Error ? err.message : "Could not fetch that URL.";
    if (message === "RESPONSE_TOO_LARGE") {
      res.status(400).json({ error: "Page too large to summarize." });
      return;
    }
    req.log.warn({ err }, "ai/summarize-url fetch failed");
    res.status(400).json({ error: message });
    return;
  } finally {
    clearTimeout(timer);
  }

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_EXTRACTED_CHARS);

  if (text.length < 80) {
    res.status(400).json({ error: "Page had no readable text to summarize." });
    return;
  }

  const prompt = `Summarize this article and include the main topic, key bullet points, a plain-language explanation, and any references or sources you can identify:

${text}`;

  try {
    const summary = await askAssistant(prompt);
    res.json(AiSummarizeUrlResponse.parse({ summary }));
  } catch (err) {
    req.log.error({ err }, "ai/summarize-url summarization failed");
    const { status, message } = aiErrorMessage(err, "Could not summarize that article right now.");
    res.status(status).json({ error: message });
  }
});

router.post("/ai/summarize-video", async (req, res): Promise<void> => {
  const parsed = AiSummarizeVideoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const prompt = `Summarize this lecture or video transcript:
- Main topic
- Key insights
- Important points
- A short plain-language summary

TRANSCRIPT:
${parsed.data.transcript}`;
  try {
    const summary = await askAssistant(prompt);
    res.json(AiSummarizeVideoResponse.parse({ summary }));
  } catch (err) {
    req.log.error({ err }, "ai/summarize-video failed");
    const { status, message } = aiErrorMessage(err, "Could not summarize that transcript right now.");
    res.status(status).json({ error: message });
  }
});

const MAX_AUDIO_BYTES = 20 * 1024 * 1024;
const MAX_AUDIO_BASE64_CHARS = Math.ceil(MAX_AUDIO_BYTES / 3) * 4 + 4;
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

type WhisperFormat = "wav" | "mp3" | "webm";
function whisperHintFromFormat(fmt?: string): WhisperFormat | null {
  if (fmt === "wav" || fmt === "mp3" || fmt === "webm") return fmt;
  return null;
}

router.post("/ai/transcribe", async (req, res): Promise<void> => {
  const parsed = AiTranscribeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { audioBase64, format: formatHint } = parsed.data;

  if (audioBase64.length > MAX_AUDIO_BASE64_CHARS) {
    res.status(400).json({ error: "Audio is too large (max 20 MB)." });
    return;
  }
  if (audioBase64.length % 4 !== 0 || !BASE64_RE.test(audioBase64)) {
    res.status(400).json({ error: "Invalid base64 audio payload." });
    return;
  }

  const buffer = Buffer.from(audioBase64, "base64");
  if (buffer.length === 0) {
    res.status(400).json({ error: "Audio payload is empty." });
    return;
  }
  if (buffer.length > MAX_AUDIO_BYTES) {
    res.status(400).json({ error: "Audio is too large (max 20 MB)." });
    return;
  }

  try {
    const { buffer: ready, format: detected } = await ensureCompatibleFormat(buffer);
    const hint = whisperHintFromFormat(formatHint);
    const useFormat: WhisperFormat = ready === buffer && hint ? hint : detected;
    const text = await speechToText(ready, useFormat);
    res.json(AiTranscribeResponse.parse({ text }));
  } catch (err) {
    req.log.error({ err }, "ai/transcribe failed");
    const { status, message } = aiErrorMessage(err, "Could not transcribe that audio right now.");
    res.status(status).json({ error: message });
  }
});

const MAX_PDF_BYTES = 15 * 1024 * 1024;
const MAX_PDF_BASE64_CHARS = Math.ceil(MAX_PDF_BYTES / 3) * 4 + 4;
const MAX_PDF_TEXT_CHARS = 60000;

router.post("/ai/summarize-pdf", async (req, res): Promise<void> => {
  const parsed = AiSummarizePdfBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { pdfBase64, filename } = parsed.data;

  if (pdfBase64.length > MAX_PDF_BASE64_CHARS) {
    res.status(400).json({ error: "PDF is too large (max 15 MB)." });
    return;
  }
  if (pdfBase64.length % 4 !== 0 || !BASE64_RE.test(pdfBase64)) {
    res.status(400).json({ error: "Invalid base64 PDF payload." });
    return;
  }

  const buffer = Buffer.from(pdfBase64, "base64");
  if (buffer.length === 0) {
    res.status(400).json({ error: "PDF payload is empty." });
    return;
  }
  if (buffer.length > MAX_PDF_BYTES) {
    res.status(400).json({ error: "PDF is too large (max 15 MB)." });
    return;
  }
  // PDF magic bytes: %PDF-
  if (buffer[0] !== 0x25 || buffer[1] !== 0x50 || buffer[2] !== 0x44 || buffer[3] !== 0x46) {
    res.status(400).json({ error: "File does not look like a PDF." });
    return;
  }

  let extractedText = "";
  let pageCount = 0;
  try {
    const data = new Uint8Array(buffer);
    const parser = new PDFParse({ data });
    const result = await parser.getText();
    extractedText = (result.text ?? "").replace(/\s+/g, " ").trim();
    pageCount = result.total ?? result.pages?.length ?? 0;
  } catch (err) {
    req.log.warn({ err }, "ai/summarize-pdf parse failed");
    res.status(400).json({ error: "Could not read text from that PDF (it may be scanned or encrypted)." });
    return;
  }

  if (extractedText.length < 80) {
    res.status(400).json({
      error:
        "PDF had no readable text (it may be a scanned image). Try a text-based PDF or transcribe it first.",
    });
    return;
  }

  const characterCount = extractedText.length;
  const truncated = extractedText.slice(0, MAX_PDF_TEXT_CHARS);
  const truncatedNote =
    characterCount > MAX_PDF_TEXT_CHARS
      ? `\n\n(Note: PDF was truncated from ${characterCount} to ${MAX_PDF_TEXT_CHARS} characters for summarization.)`
      : "";
  const fileLine = filename ? `\nDocument: ${filename}` : "";

  const prompt = `Summarize this PDF document (${pageCount} page${pageCount === 1 ? "" : "s"}).${fileLine}
- Main topic
- Key bullet points
- A simple plain-language explanation
- Mention sections, references, or sources you can identify
${truncatedNote}

CONTENT:
${truncated}`;

  try {
    const summary = await askAssistant(prompt);
    res.json(
      AiSummarizePdfResponse.parse({
        summary,
        pageCount,
        characterCount,
      }),
    );
  } catch (err) {
    req.log.error({ err }, "ai/summarize-pdf summarization failed");
    const { status, message } = aiErrorMessage(err, "Could not summarize that PDF right now.");
    res.status(status).json({ error: message });
  }
});

router.post("/ai/translate", async (req, res): Promise<void> => {
  const parsed = AiTranslateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const prompt = `Translate the following text into ${parsed.data.targetLanguage}. Return only the translation, no commentary:

${parsed.data.text}`;
  try {
    const translation = await askAssistant(prompt);
    res.json(AiTranslateResponse.parse({ translation }));
  } catch (err) {
    req.log.error({ err }, "ai/translate failed");
    const { status, message } = aiErrorMessage(err, "Could not translate that right now.");
    res.status(status).json({ error: message });
  }
});

export default router;
