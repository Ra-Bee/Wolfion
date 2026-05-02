/**
 * AI helpers for UniRab.
 *
 * The conversational and summarization helpers call the backend `/ai/*`
 * endpoints (GPT-powered). If the network is unavailable or the request
 * fails, we fall back to lightweight on-device heuristics so the app
 * always returns something useful.
 *
 * Reminder extraction stays fully on-device (regex-based) for instant UX.
 */

import { apiPost } from "./api";

const STOPWORDS = new Set([
  "the","a","an","and","or","but","of","to","in","on","at","for","with",
  "is","are","was","were","be","been","being","i","you","he","she","it","we",
  "they","that","this","these","those","my","your","our","their","as","by",
  "from","up","out","if","then","than","so","do","does","did","not","no",
  "have","has","had","will","would","can","could","should","may","might","just",
]);

export function summarizeText(text: string, maxBullets = 5): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);

  if (sentences.length === 0) return [cleaned.slice(0, 200)];
  if (sentences.length <= maxBullets) return sentences;

  const wordFreq: Record<string, number> = {};
  for (const s of sentences) {
    for (const w of s.toLowerCase().split(/[^a-z0-9]+/)) {
      if (!w || STOPWORDS.has(w) || w.length < 3) continue;
      wordFreq[w] = (wordFreq[w] ?? 0) + 1;
    }
  }

  const scored = sentences.map((s, i) => {
    let score = 0;
    for (const w of s.toLowerCase().split(/[^a-z0-9]+/)) {
      score += wordFreq[w] ?? 0;
    }
    return { s, i, score: score / Math.max(s.split(" ").length, 1) };
  });

  const top = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, maxBullets)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);
  return top;
}

const STUDY_SUGGESTIONS = [
  "Try the Pomodoro technique: 25 minutes focused, 5 minutes break. Repeat 4 times then take a longer break.",
  "Active recall beats re-reading. Close your notes and try to write down everything you remember about the topic.",
  "Teach the concept out loud as if you're explaining it to a friend. If you stumble, you've found your weak spot.",
  "Spaced repetition works wonders. Review the material today, tomorrow, in 3 days, then in a week.",
  "Mix subjects in one session (interleaving) to strengthen your ability to discriminate between similar problems.",
  "Sleep before exams matters more than the last hour of cramming. Aim for 7-8 hours.",
  "Form a study group of 2-4 people. Quiz each other and explain concepts in turn.",
];

const WELLNESS_SUGGESTIONS = [
  "Take a 10 minute walk outside between study blocks — sunlight and movement reset focus.",
  "Drink a glass of water now. Mild dehydration tanks concentration.",
  "Try the 4-7-8 breath: inhale 4s, hold 7s, exhale 8s. Three rounds calm the nervous system.",
  "Schedule one fun thing this week that has nothing to do with school. Burnout is sneaky.",
  "If you're spiraling on a problem, set a timer for 15 minutes. If you're still stuck, switch tasks.",
];

export function aiAssistantReply(prompt: string): string {
  const p = prompt.toLowerCase().trim();
  if (!p) return "Ask me anything about studying, planning, or campus life!";

  if (/(summari[sz]e|summary|tldr|tl;dr)/.test(p)) {
    const body = prompt
      .replace(/(summari[sz]e|summary|tldr|tl;dr)\s*[:,-]?\s*/i, "")
      .trim();
    if (body.length < 30) {
      return "Paste a longer chunk of text after 'summarize:' and I'll pull out the key bullets.";
    }
    const bullets = summarizeText(body, 5);
    return "Here's the gist:\n\n" + bullets.map((b) => `• ${b}`).join("\n");
  }

  if (/(study|memori[sz]e|learn|exam|test|review)/.test(p)) {
    return STUDY_SUGGESTIONS[Math.floor(Math.random() * STUDY_SUGGESTIONS.length)]!;
  }

  if (/(stress|anxious|tired|burn|overwhelmed|sleep|wellness)/.test(p)) {
    return WELLNESS_SUGGESTIONS[Math.floor(Math.random() * WELLNESS_SUGGESTIONS.length)]!;
  }

  if (/(schedule|plan|time|calendar|due|assignment)/.test(p)) {
    return "Try time-blocking your week: open your dashboard, look at upcoming deadlines, and assign each one a 60-90 min block on a specific day before its due date. Then treat those blocks like real meetings.";
  }

  if (/(friend|meet|social|club|join)/.test(p)) {
    return "Easy starting moves: post a 'looking for' on your home feed, join one study room this week, or browse the Skill Exchange for someone offering something you want.";
  }

  if (/(hello|hi|hey|yo)/.test(p)) {
    return "Hey! I'm your study buddy. Try: 'summarize: <paste notes>' or ask about study tips, planning, or how to handle stress.";
  }

  return "Good question. Two thoughts: (1) break it into the smallest concrete next step you can do in 15 minutes, (2) name the one thing that will tell you you've made progress today. Want me to summarize something instead? Try 'summarize: ...'.";
}

export interface ExtractedReminder {
  title: string;
  dueAt: number;
  priority: "low" | "med" | "high";
}

const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

function nextWeekday(target: number, base = new Date()): Date {
  const d = new Date(base);
  d.setHours(9, 0, 0, 0);
  const cur = d.getDay();
  let diff = target - cur;
  if (diff <= 0) diff += 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function parseTime(s: string): { h: number; m: number } | null {
  const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!m) return null;
  let h = parseInt(m[1]!, 10);
  const mm = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3]?.toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  if (h > 23 || mm > 59) return null;
  return { h, m: mm };
}

/**
 * Extract simple "remind me to X by/on/at <time>" patterns from text.
 * Returns up to 3 candidate reminders with parsed due dates.
 */
export function extractReminders(text: string): ExtractedReminder[] {
  if (!text || text.length < 6) return [];
  const out: ExtractedReminder[] = [];

  // Pattern: "remind me to <task> [by|on|at] <when>"
  const re = /remind me to ([^.;\n]+?)(?:\s+(?:by|on|at|before|due)\s+([^.;\n]+))?(?:[.;\n]|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) && out.length < 3) {
    const taskRaw = (m[1] ?? "").trim();
    const whenRaw = (m[2] ?? "").trim();
    if (!taskRaw) continue;
    const due = parseWhen(whenRaw);
    if (!due) continue;
    const title = taskRaw.charAt(0).toUpperCase() + taskRaw.slice(1);
    const priority: ExtractedReminder["priority"] =
      /asap|urgent|important|tonight/i.test(text) ? "high" : "med";
    out.push({ title, dueAt: due.getTime(), priority });
  }

  // Standalone "X due <when>" patterns
  if (out.length === 0) {
    const dueRe = /([A-Za-z][\w\s\-/]{2,40}?)\s+(?:is\s+)?due\s+([^.;\n]+)/gi;
    while ((m = dueRe.exec(text)) && out.length < 3) {
      const taskRaw = (m[1] ?? "").trim();
      const whenRaw = (m[2] ?? "").trim();
      const due = parseWhen(whenRaw);
      if (!due || taskRaw.length < 3) continue;
      const title = taskRaw.charAt(0).toUpperCase() + taskRaw.slice(1);
      out.push({ title, dueAt: due.getTime(), priority: "med" });
    }
  }
  return out;
  function parseWhen(s: string): Date | null {
    if (!s) return null;
    const w = s.trim().toLowerCase();
    const now = new Date();
    if (/^(today|tonight)\b/.test(w)) {
      const d = new Date();
      const t = parseTime(w);
      d.setHours(t?.h ?? (w.includes("tonight") ? 20 : 18), t?.m ?? 0, 0, 0);
      return d;
    }
    if (/^tomorrow\b/.test(w)) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const t = parseTime(w);
      d.setHours(t?.h ?? 9, t?.m ?? 0, 0, 0);
      return d;
    }
    // weekday name
    const wd = w.match(/^(?:next\s+|this\s+)?(sun|mon|tue|wed|thu|fri|sat)\w*/);
    if (wd) {
      const idx = WEEKDAY_INDEX[wd[1]!];
      if (idx != null) {
        const d = nextWeekday(idx, now);
        const t = parseTime(w);
        if (t) d.setHours(t.h, t.m, 0, 0);
        return d;
      }
    }
    // in N days/hours
    const inMatch = w.match(/^in\s+(\d+)\s*(day|days|hour|hours|hr|hrs|h)\b/);
    if (inMatch) {
      const n = parseInt(inMatch[1]!, 10);
      const unit = inMatch[2]!;
      const d = new Date();
      if (unit.startsWith("h")) d.setHours(d.getHours() + n);
      else d.setDate(d.getDate() + n);
      return d;
    }
    // bare time → today (or tomorrow if past)
    const t = parseTime(w);
    if (t) {
      const d = new Date();
      d.setHours(t.h, t.m, 0, 0);
      if (d.getTime() < now.getTime()) d.setDate(d.getDate() + 1);
      return d;
    }
    return null;
  }
}

export async function aiChatAsync(message: string): Promise<string> {
  const trimmed = message.trim();
  if (!trimmed) return aiAssistantReply(trimmed);
  try {
    const res = await apiPost<{ reply: string }>("/api/ai/chat", { message: trimmed });
    if (res?.reply && res.reply.trim()) return res.reply.trim();
    return "(offline mode) " + aiAssistantReply(trimmed);
  } catch {
    return "(offline mode) " + aiAssistantReply(trimmed);
  }
}

export async function aiSummarizeTextAsync(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";
  try {
    const res = await apiPost<{ summary: string }>("/api/ai/summarize-text", { text: trimmed });
    if (res?.summary && res.summary.trim()) return res.summary.trim();
  } catch {
    // fall through to heuristic
  }
  const bullets = summarizeText(trimmed, 5);
  const head = "(offline mode — quick local summary)\n\n";
  return bullets.length ? head + bullets.map((b) => `• ${b}`).join("\n") : head + trimmed.slice(0, 400);
}

export async function aiSummarizeUrlAsync(url: string): Promise<string> {
  const trimmed = url.trim();
  if (!trimmed) return "Paste a URL and I'll try to summarize it.";
  const res = await apiPost<{ summary: string }>("/api/ai/summarize-url", { url: trimmed });
  return res?.summary?.trim() ?? "";
}

export async function aiSummarizeVideoAsync(transcript: string): Promise<string> {
  const trimmed = transcript.trim();
  if (!trimmed) return "Paste a transcript first.";
  try {
    const res = await apiPost<{ summary: string }>("/api/ai/summarize-video", { transcript: trimmed });
    if (res?.summary && res.summary.trim()) return res.summary.trim();
  } catch {
    // fall through
  }
  const bullets = summarizeText(trimmed, 6);
  const head = "(offline mode — quick local summary)\n\n";
  return bullets.length ? head + bullets.map((b) => `• ${b}`).join("\n") : head + trimmed.slice(0, 400);
}

export async function aiTranscribeAsync(audioBase64: string, format?: string): Promise<string> {
  if (!audioBase64) throw new Error("No audio provided.");
  const res = await apiPost<{ text: string }>("/api/ai/transcribe", { audioBase64, format });
  return res?.text?.trim() ?? "";
}

export async function aiTranslateAsync(text: string, targetLanguage: string): Promise<string> {
  const trimmed = text.trim();
  const lang = targetLanguage.trim();
  if (!trimmed || !lang) return "Provide both text and a target language.";
  const res = await apiPost<{ translation: string }>("/api/ai/translate", {
    text: trimmed,
    targetLanguage: lang,
  });
  return res?.translation?.trim() ?? "";
}

export function generatePostIdeas(profile: { interests: string[]; major: string }): string[] {
  const interests = profile.interests.length ? profile.interests : ["campus life"];
  const i = interests[Math.floor(Math.random() * interests.length)];
  return [
    `Looking for a study buddy for ${profile.major} this week. Anyone down?`,
    `Hot take about ${i}: ...`,
    `Just discovered a quiet study spot on campus. DM if you want the location.`,
    `Quick question: best place near campus for late-night ${i}-themed conversations?`,
    `Weekly recap: 3 things I learned about ${i} this week.`,
  ];
}
