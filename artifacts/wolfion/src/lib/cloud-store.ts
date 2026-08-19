import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref, set, update } from "firebase/database";
import { CLOUD_ROOT, firebaseAuth, firebaseDb } from "@/lib/firebase";

/**
 * Cloud-backed mirror of `useStored<T>` from `wolfion-store.ts`.
 *
 * STORAGE FORMAT — per-record children (the stale-device safety model)
 * ---------------------------------------------------------------------
 * Lists of records (arrays of objects with a string `id`) are stored as
 * KEYED CHILDREN — one child per record at /wolfion/<key>/<recordId>,
 * each carrying a `_ord` field to preserve list order — and every write
 * is a per-record `update()`:
 *   - adds/edits write only the changed record paths
 *   - deletes write `null` ONLY for record ids this device has actually
 *     seen in its latest cloud snapshot
 * A whole-array `set()` is never issued for record lists once the node
 * is in keyed format, so a device with a months-stale offline copy is
 * STRUCTURALLY UNABLE to erase records it never saw (the two historical
 * mass data-loss incidents were exactly that: a stale tab set() the whole
 * old array over the cloud).
 *
 * Legacy nodes that still hold a whole JSON array are migrated in place:
 * the first authenticated snapshot converts the array (using that very
 * snapshot as the source of truth, so nothing can be lost) into keyed
 * children, after which all writes are per-record. A server-side script
 * (artifacts/api-server/scripts/migrate-wolfion-keyed.mjs) can do the
 * same conversion ahead of time once all clients run this code.
 *
 * Non-record values are now merge-safe too:
 * - STRING ARRAYS (yarn type names) are stored as keyed children —
 *   one child per entry at /wolfion/<key>/<sanitized-name> carrying
 *   `{ n: <name>, _ord: i }` — written with per-entry update()s, and
 *   deletions are issued only for names this device has seen in its
 *   latest cloud snapshot. Legacy plain arrays migrate in place, same
 *   as record lists.
 * - PLAIN OBJECT STORES (cost inputs, yarnPerDozen) are written with
 *   FIELD-LEVEL update() diffs against the latest cloud snapshot —
 *   only changed fields are written, and field deletions are issued
 *   only for fields present in that snapshot.
 * - Pre-sync pending flushes for both merge field-/entry-wise with the
 *   cloud copy (pending wins per field/entry, cloud-only fields and
 *   entries are preserved, no deletions) instead of replacing the node.
 * Only true scalars (numbers/strings/booleans) keep whole-value set().
 *
 * BEHAVIOUR (unchanged from the previous version)
 * -----------------------------------------------
 * - Subscribes to /wolfion/<storageKey> only after Firebase auth is
 *   established (subscribing earlier permanently kills the listener with
 *   permission_denied).
 * - Returns `[value, setValue, cloudReady]` with the same call signature
 *   as before, so admin pages need no changes.
 * - Pre-seeds from localStorage so there is something to render before
 *   the first cloud snapshot, and mirrors every cloud snapshot back to
 *   localStorage for offline use.
 * - Writes made BEFORE the first authoritative snapshot are queued and
 *   flushed merged-by-id with the cloud copy (queued records win per id,
 *   cloud records this device never saw are preserved, and NO deletions
 *   are issued from a pre-sync queue).
 * - First-time migration: if the cloud node is empty and this device has
 *   never synced this key, local data is imported once (in keyed format
 *   when it is a record list).
 */
export function useCloudStored<T>(storageKey: string, fallback: T) {
  // Pre-seed from localStorage so we have something to render before
  // the first cloud snapshot arrives — avoids a flash of empty data.
  const [value, setValue] = useState<T>(() =>
    readLocal<T>(storageKey, fallback),
  );
  // True once the first authoritative cloud snapshot has been processed for
  // this mount. Migrations must wait for this — writing before it risks
  // pushing a stale local mirror over newer cloud data.
  const [cloudReady, setCloudReady] = useState(false);
  const importedRef = useRef(false);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;
  // Holds the latest value the user wrote BEFORE Firebase auth became
  // ready. We must flush this to cloud as soon as auth is up, otherwise
  // the first onValue snapshot will overwrite the user's local edit
  // with the older cloud state and the change appears to "come back"
  // after a refresh.
  const pendingWriteRef = useRef<{ val: T } | null>(null);
  // Mirror of cloudReady for use inside setCloudValue's closure.
  const cloudReadyRef = useRef(false);
  // Latest raw cloud children for keyed record lists: recordKey ->
  // stable-stringified stored child (including `_ord`). This is the ONLY
  // basis on which deletions are issued: a record can be removed from the
  // cloud only if its id is present here, i.e. this device has seen it in
  // an authoritative snapshot. `null` means the node is not (yet) known to
  // be in keyed format for this mount.
  const cloudChildrenRef = useRef<Map<string, string> | null>(null);
  // Same idea for keyed STRING-LIST nodes (yarn type names): entry key ->
  // stable-stringified stored child. Deletions of names are only issued
  // for keys present here.
  const cloudStrChildrenRef = useRef<Map<string, string> | null>(null);
  // And for PLAIN OBJECT stores (cost inputs, yarnPerDozen): field name ->
  // stable-stringified field value from the latest cloud snapshot. Writes
  // diff against this so only changed fields are sent, and field deletions
  // are only issued for fields this device has seen.
  const cloudFieldsRef = useRef<Map<string, string> | null>(null);

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

    // A (re)subscription means we have no authoritative snapshot yet for
    // this listener — queue writes until the first snapshot arrives.
    cloudReadyRef.current = false;
    cloudChildrenRef.current = null;
    cloudStrChildrenRef.current = null;
    cloudFieldsRef.current = null;

    const db = firebaseDb();
    const nodeRef = ref(db, `${CLOUD_ROOT}/${storageKey}`);

    const unsub = onValue(
      nodeRef,
      (snap) => {
        setCloudReady(true);
        cloudReadyRef.current = true;
        const rawCloud = snap.val() as unknown;

        // Decode the cloud value. Keyed record nodes come back as plain
        // objects (record key -> record child with `_ord`); legacy nodes
        // come back as arrays; everything else is passed through as-is.
        const keyed = decodeKeyedChildren(rawCloud);
        const keyedStrings = keyed ? null : decodeKeyedStrings(rawCloud);
        const cloudVal: T | null = (
          keyed ? keyed.list : keyedStrings ? keyedStrings.list : rawCloud
        ) as T | null;
        cloudChildrenRef.current = keyed ? keyed.children : null;
        cloudStrChildrenRef.current = keyedStrings
          ? keyedStrings.children
          : null;
        cloudFieldsRef.current =
          !keyed && !keyedStrings && isPlainObject(rawCloud)
            ? fieldsMapOf(rawCloud)
            : null;

        // Flush any write queued before the first cloud snapshot arrived
        // (pre-auth edits, or edits made while this tab hadn't synced yet).
        // NEVER overwrite the cloud with the queued value directly — the
        // queued value was computed from a possibly months-stale local
        // mirror, and a blind whole-array write would erase everything
        // other devices added since (this wiped the daily production
        // history twice). Instead merge by record id: queued records win,
        // but cloud records this tab never saw are preserved — and NO
        // deletions are ever issued from a pre-sync queue.
        if (pendingWriteRef.current) {
          const pending = pendingWriteRef.current.val;
          pendingWriteRef.current = null;
          const merged = mergePendingWithCloud(pending, cloudVal);
          writeLocal(storageKey, merged);
          setValue(merged as T);
          const onFlushed = () => {
            importedRef.current = true;
            markSynced(storageKey);
          };
          const onFlushError = (err: unknown) => {
            // eslint-disable-next-line no-console
            console.error(
              `[wolfion] cloud flush failed for ${storageKey}`,
              err,
            );
          };
          // An empty array is shape-ambiguous (record list vs string
          // list). When the cloud node is in keyed-STRING format, it must
          // follow the string-list path — the record path would issue a
          // whole-node set() and wipe names this device never saw.
          const emptyOnStringNode =
            Array.isArray(merged) &&
            (merged as unknown[]).length === 0 &&
            keyedStrings != null;
          if (isRecordArray(merged) && !emptyOnStringNode) {
            if (keyed) {
              // Node already keyed: per-record update of the merged list,
              // never deleting anything (a pre-sync queue must not remove
              // records — the queue was based on possibly stale data).
              const updates = diffKeyedUpdates(
                merged as RecordLike[],
                cloudChildrenRef.current,
                /* allowDeletes */ false,
              );
              applyLocalChildren(cloudChildrenRef, updates);
              if (Object.keys(updates).length === 0) {
                onFlushed();
              } else {
                void update(nodeRef, updates).then(onFlushed, onFlushError);
              }
            } else {
              // Node was a legacy array (or empty). The merged value is
              // pending ∪ cloud — a superset of the snapshot we just
              // received — so writing the whole keyed object here cannot
              // lose records, and it converts the node to keyed format.
              const obj = toKeyedObject(merged as RecordLike[]);
              cloudChildrenRef.current = childrenMapOf(obj);
              void set(nodeRef, obj).then(onFlushed, onFlushError);
            }
          } else if (isStringArray(merged) || emptyOnStringNode) {
            if (cloudStrChildrenRef.current) {
              // Keyed string-list node: per-entry update of the merged
              // (union) list, never deleting anything from a pre-sync queue.
              const updates = diffKeyedStringUpdates(
                merged as unknown as string[],
                cloudStrChildrenRef.current,
                /* allowDeletes */ false,
              );
              applyLocalChildren(cloudStrChildrenRef, updates);
              if (Object.keys(updates).length === 0) {
                onFlushed();
              } else {
                void update(nodeRef, updates).then(onFlushed, onFlushError);
              }
            } else {
              // Legacy plain string array (or empty node). `merged` is the
              // union of pending and cloud entries, so writing the whole
              // keyed object cannot lose names — and it converts the node.
              const obj = toKeyedStringsObject(merged);
              cloudStrChildrenRef.current = childrenMapOf(obj);
              void set(nodeRef, obj).then(onFlushed, onFlushError);
            }
          } else if (isPlainObject(merged)) {
            // Plain object store (cost inputs, yarnPerDozen). `merged` is
            // cloud ∪ pending (pending fields win), so only write the
            // changed fields — and never delete fields from a pre-sync
            // queue.
            const stripped = stripUndefined(merged) as Record<string, unknown>;
            if (cloudFieldsRef.current) {
              const updates = diffFieldUpdates(
                stripped,
                cloudFieldsRef.current,
                /* allowDeletes */ false,
              );
              applyLocalFields(cloudFieldsRef, updates);
              if (Object.keys(updates).length === 0) {
                onFlushed();
              } else {
                void update(nodeRef, updates).then(onFlushed, onFlushError);
              }
            } else {
              // Cloud node was empty/scalar: merged already contains every
              // cloud field, so a whole write cannot lose anything.
              cloudFieldsRef.current = fieldsMapOf(stripped);
              void set(nodeRef, stripped).then(onFlushed, onFlushError);
            }
          } else {
            // True scalar: whole-value write (single value, last write wins).
            const payload =
              merged === undefined ? null : stripUndefined(merged);
            void set(nodeRef, payload as unknown).then(
              onFlushed,
              onFlushError,
            );
          }
          // Only mark "synced" AFTER the write succeeds — flipping the flag
          // on a failed write would make the next empty snapshot look like
          // an intentional delete and wipe valid local data.
          return;
        }

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
              // Import record lists in keyed format so the node is born
              // stale-device-safe; other values keep their raw shape.
              let payload: unknown = local;
              if (isRecordArray(local)) {
                const obj = toKeyedObject(local as RecordLike[]);
                payload = obj;
                cloudChildrenRef.current = childrenMapOf(obj);
              } else if (isStringArray(local)) {
                // Import string lists in keyed format too, so the node is
                // born stale-device-safe.
                const obj = toKeyedStringsObject(local);
                payload = obj;
                cloudStrChildrenRef.current = childrenMapOf(obj);
              } else if (isPlainObject(local)) {
                const stripped = stripUndefined(local) as Record<
                  string,
                  unknown
                >;
                payload = stripped;
                cloudFieldsRef.current = fieldsMapOf(stripped);
              }
              // Only mark "synced" AFTER the cloud write actually succeeds.
              // If the very first import write fails (network/auth blip), we
              // must NOT flip the flag — otherwise the next empty snapshot is
              // mistaken for an intentional delete and wipes valid local data.
              void set(nodeRef, payload)
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
          if (Array.isArray(fallbackRef.current)) {
            // The node is empty; empty children maps let subsequent
            // record-list / string-list writes go through the keyed
            // per-entry path.
            cloudChildrenRef.current = new Map();
            cloudStrChildrenRef.current = new Map();
          } else if (isPlainObject(fallbackRef.current)) {
            // Empty node for an object store: field-level writes can
            // proceed against an empty field map.
            cloudFieldsRef.current = new Map();
          }
          const empty = fallbackRef.current as T;
          writeLocal(storageKey, empty);
          setValue(empty);
          return;
        }

        // Cloud has data. If it is still a legacy whole array of records,
        // convert it in place to keyed children. The conversion is derived
        // from the authoritative snapshot we JUST received, so it cannot
        // lose anything — and from then on all writes are per-record.
        if (!keyed && isRecordArray(cloudVal)) {
          const obj = toKeyedObject(cloudVal as unknown as RecordLike[]);
          cloudChildrenRef.current = childrenMapOf(obj);
          void set(nodeRef, obj).catch((err) => {
            // Conversion failed (e.g. network blip): forget the keyed map
            // so we retry on the next snapshot instead of issuing keyed
            // updates against a node that is still an array.
            cloudChildrenRef.current = null;
            // eslint-disable-next-line no-console
            console.error(
              `[wolfion] keyed migration failed for ${storageKey}`,
              err,
            );
          });
        } else if (!keyed && !keyedStrings && isStringArray(cloudVal)) {
          // Legacy plain string array (yarn type names): convert in place
          // to keyed children, derived from the authoritative snapshot we
          // just received — nothing can be lost.
          const obj = toKeyedStringsObject(cloudVal);
          cloudStrChildrenRef.current = childrenMapOf(obj);
          void set(nodeRef, obj).catch((err) => {
            cloudStrChildrenRef.current = null;
            // eslint-disable-next-line no-console
            console.error(
              `[wolfion] keyed migration failed for ${storageKey}`,
              err,
            );
          });
        }

        // Adopt the cloud data and mirror it to localStorage so the
        // app still works offline / when cloud is unreachable.
        importedRef.current = true;
        markSynced(storageKey);
        // Repair RTDB's array→object coercion in legacy (non-keyed) nodes
        // too, so nested lists (e.g. a product's yarnRecipe) always come
        // back as real arrays.
        const revived = reviveArrays(cloudVal);
        writeLocal(storageKey, revived);
        setValue(revived);
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
      if (firebaseAuth().currentUser && cloudReadyRef.current) {
        const db = firebaseDb();
        const nodeRef = ref(db, `${CLOUD_ROOT}/${storageKey}`);
        // Same ambiguity guard as the flush path: an empty array written
        // while the node is in keyed-STRING format must take the
        // string-list path so deletions stay limited to seen entries.
        const emptyOnStringNode =
          Array.isArray(resolved) &&
          (resolved as unknown[]).length === 0 &&
          cloudStrChildrenRef.current != null &&
          cloudChildrenRef.current == null;
        if (
          isRecordArray(resolved) &&
          cloudChildrenRef.current &&
          !emptyOnStringNode
        ) {
          // Keyed per-record write: only changed records are written, and
          // deletions are issued ONLY for record ids present in the latest
          // cloud snapshot this device has seen. A stale device therefore
          // cannot erase records it never saw.
          const updates = diffKeyedUpdates(
            resolved as unknown as RecordLike[],
            cloudChildrenRef.current,
            /* allowDeletes */ true,
          );
          applyLocalChildren(cloudChildrenRef, updates);
          if (Object.keys(updates).length > 0) {
            void update(nodeRef, updates).catch((err) => {
              // eslint-disable-next-line no-console
              console.error(
                `[wolfion] cloud write failed for ${storageKey}`,
                err,
              );
            });
          }
        } else if (isRecordArray(resolved) && !emptyOnStringNode) {
          // Record list, but the node hasn't been converted to keyed
          // format yet (legacy array in cloud, or migration write still
          // in flight). `resolved` is based on the fresh authoritative
          // snapshot (cloudReady), so a one-time keyed set() is safe and
          // completes the conversion.
          const obj = toKeyedObject(resolved as unknown as RecordLike[]);
          cloudChildrenRef.current = childrenMapOf(obj);
          // The node is being (re)written in record-keyed format; any
          // string-list/field maps from a previous shape are now stale.
          cloudStrChildrenRef.current = null;
          cloudFieldsRef.current = null;
          void set(nodeRef, obj).catch((err) => {
            cloudChildrenRef.current = null;
            // eslint-disable-next-line no-console
            console.error(
              `[wolfion] cloud write failed for ${storageKey}`,
              err,
            );
          });
        } else if (
          (isStringArray(resolved) || emptyOnStringNode) &&
          cloudStrChildrenRef.current
        ) {
          // Keyed per-entry string-list write: only changed names are
          // written, and deletions are issued ONLY for entry keys present
          // in the latest cloud snapshot this device has seen. (An empty
          // list deletes exactly the entries this device has seen —
          // an intentional, snapshot-based delete-all.)
          const updates = diffKeyedStringUpdates(
            resolved as unknown as string[],
            cloudStrChildrenRef.current,
            /* allowDeletes */ true,
          );
          applyLocalChildren(cloudStrChildrenRef, updates);
          if (Object.keys(updates).length > 0) {
            void update(nodeRef, updates).catch((err) => {
              // eslint-disable-next-line no-console
              console.error(
                `[wolfion] cloud write failed for ${storageKey}`,
                err,
              );
            });
          }
        } else if (isStringArray(resolved)) {
          // String list whose node hasn't been converted to keyed format
          // yet. `resolved` is based on the fresh authoritative snapshot
          // (cloudReady), so a one-time keyed set() is safe and completes
          // the conversion.
          const obj = toKeyedStringsObject(resolved);
          cloudStrChildrenRef.current = childrenMapOf(obj);
          cloudChildrenRef.current = null;
          cloudFieldsRef.current = null;
          void set(nodeRef, obj).catch((err) => {
            cloudStrChildrenRef.current = null;
            // eslint-disable-next-line no-console
            console.error(
              `[wolfion] cloud write failed for ${storageKey}`,
              err,
            );
          });
        } else if (isPlainObject(resolved)) {
          // Plain object store (cost inputs, yarnPerDozen): field-level
          // diff against the latest cloud snapshot. Only changed fields
          // are written; field deletions are issued only for fields this
          // device has actually seen in the cloud.
          const stripped = stripUndefined(resolved) as Record<
            string,
            unknown
          >;
          if (cloudFieldsRef.current) {
            const updates = diffFieldUpdates(
              stripped,
              cloudFieldsRef.current,
              /* allowDeletes */ true,
            );
            applyLocalFields(cloudFieldsRef, updates);
            if (Object.keys(updates).length > 0) {
              void update(nodeRef, updates).catch((err) => {
                // eslint-disable-next-line no-console
                console.error(
                  `[wolfion] cloud write failed for ${storageKey}`,
                  err,
                );
              });
            }
          } else {
            // No field map yet (node was a scalar or shape mismatch).
            // `resolved` is based on the fresh snapshot, so a one-time
            // whole write is safe; subsequent writes will be field-level.
            cloudFieldsRef.current = fieldsMapOf(stripped);
            cloudChildrenRef.current = null;
            cloudStrChildrenRef.current = null;
            void set(nodeRef, stripped).catch((err) => {
              cloudFieldsRef.current = null;
              // eslint-disable-next-line no-console
              console.error(
                `[wolfion] cloud write failed for ${storageKey}`,
                err,
              );
            });
          }
        } else {
          // True scalar: whole-value write, as before.
          const payload =
            resolved === undefined ? null : stripUndefined(resolved);
          void set(nodeRef, payload as unknown).catch((err) => {
            // eslint-disable-next-line no-console
            console.error(
              `[wolfion] cloud write failed for ${storageKey}`,
              err,
            );
          });
        }
      } else {
        // Auth not ready, or the first authoritative cloud snapshot
        // hasn't arrived yet. Queue the write; the onValue handler
        // merges it with the cloud copy by record id and flushes it
        // without deletions. Writing straight to the cloud here would
        // base the write on a possibly stale local mirror and erase
        // records added from other devices.
        pendingWriteRef.current = { val: resolved };
      }
      return resolved;
    });
  };

  return [value, setCloudValue, cloudReady] as const;
}

// ---------------------------------------------------------------------------
// Keyed-children helpers
// ---------------------------------------------------------------------------

type RecordLike = { id: string } & Record<string, unknown>;

// Field added to each stored child to preserve the list order. Stripped
// before records are handed back to the app.
const ORD = "_ord";

// Field carrying the entry's string value in a keyed string-list child.
const STR = "n";

// True for NON-EMPTY arrays of non-empty strings — the shape eligible for
// per-entry keyed storage (yarn type names). Empty arrays are handled by
// the record-array path (both formats store "empty" as a null node).
export function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((x) => typeof x === "string" && x.length > 0)
  );
}

// True for plain non-array objects (cost inputs, yarnPerDozen).
export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

// Convert a string list to the keyed-children object stored in RTDB:
// one child per entry at <sanitized-name>, carrying the original string
// (`n`) and its list position (`_ord`). Duplicate names collapse to one.
export function toKeyedStringsObject(
  items: string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  items.forEach((s, i) => {
    const key = sanitizeKey(s);
    if (key.length === 0) return;
    if (!(key in out)) out[key] = { [STR]: s, [ORD]: i };
  });
  return out;
}

// Detect a keyed string-list node and decode it back into an ordered
// string array. Returns null when the value is not in this format.
export function decodeKeyedStrings(
  raw: unknown,
): { list: string[]; children: Map<string, string> } | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const entries = Object.entries(raw as Record<string, unknown>);
  if (entries.length === 0) return null;
  for (const [key, child] of entries) {
    if (
      child == null ||
      typeof child !== "object" ||
      Array.isArray(child) ||
      typeof (child as Record<string, unknown>)[STR] !== "string" ||
      sanitizeKey((child as Record<string, string>)[STR]) !== key
    ) {
      return null;
    }
  }
  const children = new Map<string, string>();
  for (const [key, child] of entries) {
    children.set(key, stableStringify(child));
  }
  const list = entries
    .map(([key, child]) => ({ key, child: child as Record<string, unknown> }))
    .sort((a, b) => {
      const ao = ordOf(a.child);
      const bo = ordOf(b.child);
      if (ao !== bo) return ao - bo;
      return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    })
    .map(({ child }) => child[STR] as string);
  return { list, children };
}

// Compute the multi-path update() payload for a keyed string-list node:
// changed/added entries are written, unchanged ones are skipped, and
// (only when allowDeletes) entry keys present in the latest cloud
// snapshot but absent from the new list are set to null.
export function diffKeyedStringUpdates(
  items: string[],
  cloudChildren: Map<string, string> | null,
  allowDeletes: boolean,
): Record<string, unknown> {
  const updates: Record<string, unknown> = {};
  const seen = new Set<string>();
  items.forEach((s, i) => {
    const key = sanitizeKey(s);
    if (key.length === 0 || seen.has(key)) return;
    seen.add(key);
    const child = { [STR]: s, [ORD]: i };
    if (cloudChildren?.get(key) !== stableStringify(child)) {
      updates[key] = child;
    }
  });
  if (allowDeletes && cloudChildren) {
    for (const key of cloudChildren.keys()) {
      if (!seen.has(key)) updates[key] = null;
    }
  }
  return updates;
}

// Compute the field-level update() payload for a plain object store:
// changed/added fields are written, unchanged fields are skipped, and
// (only when allowDeletes) fields present in the latest cloud snapshot
// but absent from the new object are set to null. Field names are kept
// verbatim so the stored shape matches the previous whole-set() format.
export function diffFieldUpdates(
  next: Record<string, unknown>,
  cloudFields: Map<string, string> | null,
  allowDeletes: boolean,
): Record<string, unknown> {
  const updates: Record<string, unknown> = {};
  const seen = new Set<string>();
  for (const [k, v] of Object.entries(next)) {
    if (v === undefined) continue;
    seen.add(k);
    if (cloudFields?.get(k) !== stableStringify(v)) {
      updates[k] = v;
    }
  }
  if (allowDeletes && cloudFields) {
    for (const key of cloudFields.keys()) {
      if (!seen.has(key)) updates[key] = null;
    }
  }
  return updates;
}

// Optimistically fold a field-level update() payload into the local
// field map, mirroring applyLocalChildren.
function applyLocalFields(
  refObj: { current: Map<string, string> | null },
  updates: Record<string, unknown>,
): void {
  if (!refObj.current) return;
  for (const [key, v] of Object.entries(updates)) {
    if (v === null) refObj.current.delete(key);
    else refObj.current.set(key, stableStringify(v));
  }
}

export function fieldsMapOf(obj: Record<string, unknown>): Map<string, string> {
  const m = new Map<string, string>();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    m.set(k, stableStringify(v));
  }
  return m;
}

// True for arrays whose every element is an object with a string `id` —
// the shape eligible for per-record keyed storage. Empty arrays qualify.
export function isRecordArray(value: unknown): value is RecordLike[] {
  return (
    Array.isArray(value) &&
    value.every(
      (x) =>
        x != null &&
        typeof x === "object" &&
        !Array.isArray(x) &&
        typeof (x as { id?: unknown }).id === "string" &&
        (x as { id: string }).id.length > 0,
    )
  );
}

// RTDB keys must not contain . # $ [ ] / — ids are UUIDs or slugs today,
// but sanitize defensively. The record's own `id` field stays untouched
// and remains the app-level identity.
export function sanitizeKey(id: string): string {
  return id.replace(/[.#$/[\]]/g, "_");
}

// Convert a record array to the keyed-children object stored in RTDB.
export function toKeyedObject(records: RecordLike[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  records.forEach((rec, i) => {
    out[sanitizeKey(rec.id)] = { ...stripUndefined(rec), [ORD]: i };
  });
  return out;
}

// Detect a keyed-children node and decode it back into an ordered record
// array. Returns null when the value is not in keyed format (legacy array,
// scalar, or a plain object store like cost inputs — whose values are
// numbers, not id-bearing records).
export function decodeKeyedChildren(
  raw: unknown,
): { list: RecordLike[]; children: Map<string, string> } | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const entries = Object.entries(raw as Record<string, unknown>);
  if (entries.length === 0) return null;
  for (const [key, child] of entries) {
    if (
      child == null ||
      typeof child !== "object" ||
      Array.isArray(child) ||
      typeof (child as { id?: unknown }).id !== "string" ||
      sanitizeKey((child as { id: string }).id) !== key
    ) {
      return null;
    }
  }
  const children = new Map<string, string>();
  for (const [key, child] of entries) {
    children.set(key, stableStringify(child));
  }
  const list = entries
    .map(([key, child]) => ({ key, child: child as RecordLike }))
    .sort((a, b) => {
      const ao = ordOf(a.child);
      const bo = ordOf(b.child);
      if (ao !== bo) return ao - bo;
      return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    })
    .map(({ child }) => {
      const { [ORD]: _drop, ...rest } = child as Record<string, unknown>;
      return reviveArrays(rest) as RecordLike;
    });
  return { list, children };
}

// RTDB has no real array type: an array field nested inside a record (e.g.
// a product's yarnRecipe) can come back as an object keyed "0","1",... after
// partial updates or sparse writes. Iterating such an object with for..of
// throws "x is not iterable" and crashed the admin dashboard. Convert any
// all-integer-keyed plain object back into a proper array, recursively.
export function reviveArrays<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(reviveArrays) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length > 0 && keys.every((k) => /^\d+$/.test(k))) {
      return keys
        .map((k) => Number(k))
        .sort((a, b) => a - b)
        .map((k) => reviveArrays(obj[String(k)])) as unknown as T;
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = reviveArrays(v);
    return out as unknown as T;
  }
  return value;
}

function ordOf(child: unknown): number {
  const v = (child as Record<string, unknown>)[ORD];
  return typeof v === "number" && Number.isFinite(v)
    ? v
    : Number.MAX_SAFE_INTEGER;
}

// Compute the multi-path update() payload for a keyed node: changed/added
// records are written, unchanged records are skipped, and (only when
// allowDeletes) record keys present in the latest cloud snapshot but
// absent from the new list are set to null.
export function diffKeyedUpdates(
  records: RecordLike[],
  cloudChildren: Map<string, string> | null,
  allowDeletes: boolean,
): Record<string, unknown> {
  const updates: Record<string, unknown> = {};
  const seen = new Set<string>();
  records.forEach((rec, i) => {
    const key = sanitizeKey(rec.id);
    seen.add(key);
    const child = { ...stripUndefined(rec), [ORD]: i };
    if (cloudChildren?.get(key) !== stableStringify(child)) {
      updates[key] = child;
    }
  });
  if (allowDeletes && cloudChildren) {
    for (const key of cloudChildren.keys()) {
      if (!seen.has(key)) updates[key] = null;
    }
  }
  return updates;
}

// Optimistically fold an update() payload into the local children map so
// back-to-back writes diff against what we just sent (the onValue echo
// will confirm/replace it shortly after).
function applyLocalChildren(
  refObj: { current: Map<string, string> | null },
  updates: Record<string, unknown>,
): void {
  if (!refObj.current) return;
  for (const [key, child] of Object.entries(updates)) {
    if (child === null) refObj.current.delete(key);
    else refObj.current.set(key, stableStringify(child));
  }
}

function childrenMapOf(obj: Record<string, unknown>): Map<string, string> {
  const m = new Map<string, string>();
  for (const [key, child] of Object.entries(obj)) {
    m.set(key, stableStringify(child));
  }
  return m;
}

// JSON.stringify with sorted object keys, so structurally equal records
// compare equal regardless of key insertion order (RTDB snapshots don't
// guarantee key order).
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    return `{${keys
      .map(
        (k) =>
          `${JSON.stringify(k)}:${stableStringify(
            (value as Record<string, unknown>)[k],
          )}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

// Merge a queued (possibly stale-based) write with the current cloud value.
// Only applies to arrays of objects with string `id`s — the queued records
// win per id, and cloud records the queued write never saw are appended.
// For anything else the queued value is returned as-is. The trade-off: a
// delete made before the first cloud sync can resurrect, which is far less
// harmful than a stale tab erasing months of records added elsewhere.
// Merge a queued (possibly stale-based) write with the current cloud value
// across all supported shapes:
// - record arrays: mergeByIdPreferPending (pending wins per id)
// - string arrays: union — pending order first, cloud-only names appended
// - plain objects: field-wise — cloud fields first, pending fields win
// - anything else: pending as-is (scalars have no mergeable structure)
// No deletions ever result from a pre-sync merge.
export function mergePendingWithCloud<T>(pending: T, cloud: T | null): T {
  if (
    Array.isArray(pending) &&
    pending.length === 0 &&
    isStringArray(cloud)
  ) {
    // An empty pending array against a cloud string list: a pre-sync
    // queue must never delete, so the cloud names win (a delete-all made
    // before the first sync resurrects — same trade-off as records).
    return cloud as unknown as T;
  }
  if (isRecordArray(pending)) {
    return mergeByIdPreferPending(pending, cloud);
  }
  if (isStringArray(pending) && isStringArray(cloud)) {
    const have = new Set(pending);
    const extras = cloud.filter((s) => !have.has(s));
    if (extras.length === 0) return pending;
    return [...pending, ...extras] as unknown as T;
  }
  if (
    isPlainObject(pending) &&
    isPlainObject(cloud) &&
    !isRecordArray(pending) &&
    decodeKeyedChildren(cloud) == null &&
    decodeKeyedStrings(cloud) == null
  ) {
    return { ...cloud, ...pending } as unknown as T;
  }
  return pending;
}

export function mergeByIdPreferPending<T>(pending: T, cloud: T | null): T {
  if (
    !Array.isArray(pending) ||
    !Array.isArray(cloud) ||
    cloud.length === 0
  ) {
    return pending;
  }
  if (!isRecordArray(pending) || !isRecordArray(cloud)) return pending;
  const pendingIds = new Set(
    (pending as Array<{ id: string }>).map((x) => x.id),
  );
  const extras = (cloud as Array<{ id: string }>).filter(
    (x) => !pendingIds.has(x.id),
  );
  if (extras.length === 0) return pending;
  return [...(pending as unknown[]), ...extras] as unknown as T;
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
