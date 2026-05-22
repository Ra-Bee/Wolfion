import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getDatabase, type Database } from "firebase-admin/database";
import { logger } from "./logger";

// Public Firebase project identifiers for the Wolfion RTDB instance.
// The web client uses the same projectId + databaseURL; only the apiKey
// lives in the VITE_FIREBASE_API_KEY secret (it's a public client
// identifier but Replit chat scrubs it, so we read it from env).
const FIREBASE_PROJECT_ID = "wolfion-e0df3";
const FIREBASE_DATABASE_URL =
  "https://wolfion-e0df3-default-rtdb.asia-southeast1.firebasedatabase.app";

let cachedApp: App | null = null;

function loadServiceAccount(): Record<string, unknown> {
  // Source 1 — env var with JSON content (Render production uses this).
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      // Fall through to file-based fallback below — happens on Replit
      // dev where the secret was set to a non-JSON value (the web
      // API key) and can't be modified via the agent API.
      logger.warn(
        "FIREBASE_SERVICE_ACCOUNT env var is not valid JSON; trying file fallback",
      );
    }
  }

  // Source 2 — JSON file on disk. Resolved relative to the monorepo
  // root so the api-server picks up `.local/state/firebase-sa.json`
  // when running under any workflow (cwd may be the artifact dir).
  const explicit = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;
  const candidates = [
    explicit,
    resolve(process.cwd(), ".local/state/firebase-sa.json"),
    resolve(process.cwd(), "../../.local/state/firebase-sa.json"),
  ].filter((p): p is string => Boolean(p));
  for (const path of candidates) {
    if (existsSync(path)) {
      try {
        const txt = readFileSync(path, "utf8");
        const parsed = JSON.parse(txt) as Record<string, unknown>;
        logger.info({ path }, "loaded firebase service account from file");
        return parsed;
      } catch (err) {
        logger.error({ err, path }, "failed to parse firebase-sa file");
      }
    }
  }

  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT secret is not valid JSON and no fallback " +
      "file was found at .local/state/firebase-sa.json. Generate a " +
      "service-account key in the Firebase console and paste the JSON " +
      "into the FIREBASE_SERVICE_ACCOUNT secret.",
  );
}

function getApp(): App {
  if (cachedApp) return cachedApp;
  const existing = getApps()[0];
  if (existing) {
    cachedApp = existing;
    return existing;
  }
  const serviceAccount = loadServiceAccount();
  cachedApp = initializeApp({
    credential: cert(serviceAccount as never),
    projectId: FIREBASE_PROJECT_ID,
    databaseURL: FIREBASE_DATABASE_URL,
  });
  logger.info({ projectId: FIREBASE_PROJECT_ID }, "firebase admin initialised");
  return cachedApp;
}

export function firebaseAuth(): Auth {
  return getAuth(getApp());
}

export function firebaseDb(): Database {
  return getDatabase(getApp());
}

export const FIREBASE_CONFIG_PUBLIC = {
  projectId: FIREBASE_PROJECT_ID,
  databaseURL: FIREBASE_DATABASE_URL,
};
