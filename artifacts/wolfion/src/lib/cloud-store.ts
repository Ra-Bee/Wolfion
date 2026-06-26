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
  // Holds the latest value the user wrote BEFORE Firebase auth became
  // ready. We must flush this to cloud as soon as auth is up, otherwise
  // the first onValue snapshot will overwrite the user's local edit
  // with the older cloud state and the change appears to "come back"
  // after a refresh.
  const pendingWriteRef = useRef<{ val: T } | null>(null);

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

    // Flush any write the user made before auth was ready. Do this
    // BEFORE the subscription is opened so the very first snapshot we
    // receive already reflects the user's change (or at worst we get
    // the old value briefly, then our own write echoes back).
    if (pendingWriteRef.current) {
      const pending = pendingWriteRef.current.val;
      pendingWriteRef.current = null;
      importedRef.current = true; // we've effectively migrated
      const payload =
        pending === undefined ? null : stripUndefined(pending);
      void set(nodeRef, payload as unknown).catch((err) => {
        // eslint-disable-next-line no-console
        console.error(
          `[wolfion] cloud flush failed for ${storageKey}`,
          err,
        );
      });
    }

    const unsub = onValue(
      nodeRef,
      (snap) => {
        const cloudVal = snap.val() as T | null;

        if (cloudVal == null) {
          // Cloud node is empty. There are two very different reasons:
          //   (a) FIRST migration — this device has local-only data that
          //       has never been pushed to the cloud. Import it once.
          //   (b) INTENTIONAL empty — the data was synced before and then
          //       everything was deleted (here or on another device). RTDB
          //       stores an empty array/object as null, so a delete-to-empty
          //       looks identical to "never existed". We must NOT re-upload
          //       this device's stale local copy, or deleted entries come
          //       back ("it still shows there later").
          // The persistent per-key "synced once" flag tells the two apart.
          const syncedBefore = importedRef.current || readSyncedFlag(storageKey);
          if (!syncedBefore) {
            const local = readLocalRaw(storageKey);
            if (local != null) {
              // Only mark "synced" AFTER the cloud write actually succeeds.
              // If the very first import write fails (network/auth blip), we
              // must NOT flip the flag — otherwise the next empty snapshot is
              // mistaken for an intentional delete and wipes valid local data.
              void set(nodeRef, local)
                .then(() => {
                  importedRef.current = true;
                  markSynced(storageKey);
                })
                .catch((err) => {
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
          // Intentional / genuine empty: trust the cloud. Clear stale local
          // so deleted entries don't linger, and fall back to the default.
          importedRef.current = true;
          markSynced(storageKey);
          const empty = fallbackRef.current as T;
          writeLocal(storageKey, empty);
          setValue(empty);
          return;
        }

        // Cloud has data — adopt it and mirror to localStorage so the
        // app still works offline / when cloud is unreachable.
        importedRef.current = true;
        markSynced(storageKey);
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
      if (firebaseAuth().currentUser) {
        const db = firebaseDb();
        const nodeRef = ref(db, `${CLOUD_ROOT}/${storageKey}`);
        const payload =
          resolved === undefined ? null : stripUndefined(resolved);
        void set(nodeRef, payload as unknown).catch((err) => {
          // eslint-disable-next-line no-console
          console.error(
            `[wolfion] cloud write failed for ${storageKey}`,
            err,
          );
        });
      } else {
        // Auth not ready yet — remember this write so the subscribe
        // effect can flush it the moment sign-in completes. Without
        // this, the first cloud snapshot (older data) would clobber
        // the user's edit/delete and it would reappear on refresh.
        pendingWriteRef.current = { val: resolved };
      }
      return resolved;
    });
  };

  return [value, setCloudValue] as const;
}

// Realtime Database rejects `undefined` anywhere in the payload with
// "set failed: value argument contains undefined in property '...'".
// React form state happily produces undefined for optional fields
// (e.g. workers[i].nextPaymentDate before a date is picked), which
// crashes the whole admin dashboard. Strip it out before writing —
// drop undefined object keys entirely and convert undefined inside
// arrays to null so indices stay aligned.
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => (v === undefined ? null : stripUndefined(v))) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = stripUndefined(v);
    }
    return out as unknown as T;
  }
  return value;
}

// Persistent per-key marker: "we have completed at least one cloud sync for
// this key on this device". Used to tell a first-time migration (import local
// once) apart from an intentional delete-to-empty (trust the empty cloud).
function syncedFlagKey(key: string): string {
  return `${key}__cloudSynced`;
}

function readSyncedFlag(key: string): boolean {
  try {
    return localStorage.getItem(syncedFlagKey(key)) === "1";
  } catch {
    return false;
  }
}

function markSynced(key: string): void {
  try {
    localStorage.setItem(syncedFlagKey(key), "1");
  } catch {
    /* ignore */
  }
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
