import Groq from "groq-sdk";

// Lazy client: validate the API key only when the client is actually
// used. This lets the server boot (and serve non-AI routes like
// /api/healthz, /api/products, /api/firebase/token) in environments
// that don't provision GROQ_API_KEY (e.g. Wolfion-only deployments).
let _groq: Groq | null = null;
function getGroq(): Groq {
  if (_groq) return _groq;
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY must be set to use AI features.",
    );
  }
  _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

export const groq = new Proxy({} as Groq, {
  get(_t, prop) {
    const client = getGroq() as unknown as Record<string | symbol, unknown>;
    return client[prop];
  },
});

export const GROQ_CHAT_MODEL = "llama-3.3-70b-versatile";
export const GROQ_FAST_MODEL = "llama-3.1-8b-instant";
export const GROQ_TRANSCRIBE_MODEL = "whisper-large-v3-turbo";
