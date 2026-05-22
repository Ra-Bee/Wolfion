import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref, set } from "firebase/database";
import { CLOUD_ROOT, firebaseAuth, firebaseDb } from "@/lib/firebase";

/**
 * Cloud-backed mirror of `useStored<T>` from `wolfion-store.ts`.
 *
 * - Subscribes to /wolfion/<storageKey> in Realtime Database, but ONLY
 *   after Firebase auth is established. Subscribing before sign-in
 *   would trigger an immediate permission_denied from the RTDB rules
 *   and the cancelled listener would never recover for the lifetime
 *   of the mount, leaving the page stuck on stale local data.
 * - Returns `[value, setValue]` with the same call signature as
 *   useStored, so existing pages can swap the import with no API change.
 * - Writes go straight to RTDB; the onValue subscription echoes the
 *   change back into local state (also keeps it in sync across devices).
 * - On first ready snapshot (cloud is null AND localStorage has data
 *   under `storageKey`), uploads the local data to cloud one time so
 *   admins don't lose existing entries when migrating from local mode.
 *
 * `storageKey` mirrors STORAGE_KEYS so local cache and cloud node line
 * up; the cloud path is `/wolfion/<storageKey>`.
 */
export function useCloudStored<T>(storageKey: string, fallback: T) {
  // Pre-seed from localStorage so we have something to render before
  // the first cloud snapshot arrives — avoids a flash of empty data.
  const [value, setValue] = useState<T>(() =>
    readLocal<T>(storageKey, fallback),
  );
  const importedRef = useRef(false);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  // Track Firebase auth uid so we can (re)subscribe each time the
  // bridge signs in (or re-signs in after a token refresh).
  const [authUid, setAuthUid] = useState<string | null>(
    () => firebaseAuth().currentUser?.uid ?? null,
  );
  useEffect(() => {
    return onAuthStateChanged(firebaseAuth(), (u) =>
      setAuthUid(u?.uid ?? null),
    );
  }, []);

  useEffect(() => {
    // Wait for Firebase auth before opening the subscription. Without
    // an admin token RTDB will reject the listener and we'd silently
    // drop sync for this mount.
    if (!authUid) return;

    const db = firebaseDb();
    const nodeRef = ref(db, `${CLOUD_ROOT}/${storageKey}`);
    const unsub = onValue(
      nodeRef,
      (snap) => {
        const cloudVal = snap.val() as T | null;

        if (cloudVal == null) {
          // Cloud node is empty. Do the one-time local -> cloud import
          // if (a) we haven't already and (b) we actually have local
          // data to seed with.
          if (!importedRef.current) {
            importedRef.current = true;
            const local = readLocalRaw(storageKey);
            if (local != null) {
              void set(nodeRef, local).catch((err) => {
                // eslint-disable-next-line no-console
                console.error(
                  `[wolfion] cloud import failed for ${storageKey}`,
                  err,
                );
              });
              setValue(local as T);
              return;
            }
          }
          // Genuine empty state. Don't clobber whatever the user has
          // locally (e.g. a stale fallback render); fall through to
          // fallback only if we currently have nothing.
          setValue((prev) =>
            prev === undefined || prev === null
              ? (fallbackRef.current as T)
              : prev,
          );
          return;
        }

        // Cloud has data — adopt it and mirror to localStorage so the
        // app still works offline / when cloud is unreachable.
        importedRef.current = true;
        writeLocal(storageKey, cloudVal);
        setValue(cloudVal);
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error(
          `[wolfion] cloud subscribe failed for ${storageKey}`,
          err,
        );
      },
    );
    return unsub;
  }, [storageKey, authUid]);

  const setCloudValue = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      // Optimistic local cache update so the UI feels instant and so
      // we keep an offline copy.
      writeLocal(storageKey, resolved);
      // If Firebase isn't ready yet, skip the cloud write — the
      // subscription's one-time import will push our local snapshot
      // up as soon as sign-in completes.
      if (firebaseAuth().currentUser) {
        const db = firebaseDb();
        const nodeRef = ref(db, `${CLOUD_ROOT}/${storageKey}`);
        const payload = resolved === undefined ? null : resolved;
        void set(nodeRef, payload as unknown).catch((err) => {
          // eslint-disable-next-line no-console
          console.error(
            `[wolfion] cloud write failed for ${storageKey}`,
            err,
          );
        });
      }
      return resolved;
    });
  };

  return [value, setCloudValue] as const;
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function readLocalRaw(key: string): unknown {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return null;
    return JSON.parse(v);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}
