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
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT secret is not set. Generate a service " +
        "account key in Firebase console and paste the JSON into the " +
        "Replit secret named FIREBASE_SERVICE_ACCOUNT.",
    );
  }
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is not valid JSON. Paste the entire " +
        "contents of the service-account .json file as the secret value.",
    );
  }
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
