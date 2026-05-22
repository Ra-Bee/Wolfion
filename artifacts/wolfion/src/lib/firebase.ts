import { initializeApp, type FirebaseApp, getApps } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

// Public Firebase web config for the Wolfion project. apiKey is a
// client-side public identifier (NOT a secret) but Replit chat scrubs
// values that look like API keys, so we read it from the Vite env that
// the dev script wires up to the Replit secret VITE_FIREBASE_API_KEY.
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;

const firebaseConfig = {
  apiKey: apiKey ?? "",
  authDomain: "wolfion-e0df3.firebaseapp.com",
  projectId: "wolfion-e0df3",
  databaseURL:
    "https://wolfion-e0df3-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "wolfion-e0df3.firebasestorage.app",
  messagingSenderId: "456345206424",
  appId: "1:456345206424:web:be7285a5474bf028081aed",
};

let cached: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (cached) return cached;
  const existing = getApps()[0];
  if (existing) {
    cached = existing;
    return existing;
  }
  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn(
      "[wolfion] VITE_FIREBASE_API_KEY is not set — Firebase auth and " +
        "Realtime Database will fail. Set it as a Replit secret.",
    );
  }
  cached = initializeApp(firebaseConfig);
  return cached;
}

export function firebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function firebaseDb(): Database {
  return getDatabase(getFirebaseApp());
}

// Root path under which all Wolfion admin data is mirrored in RTDB.
// Matches the path gated by database.rules.json.
export const CLOUD_ROOT = "wolfion";
