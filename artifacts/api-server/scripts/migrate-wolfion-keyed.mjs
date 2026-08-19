#!/usr/bin/env node
/**
 * One-time migration: convert Wolfion RTDB record lists from whole JSON
 * arrays (/wolfion/<key> = [ {id,...}, ... ]) to per-record keyed children
 * (/wolfion/<key>/<recordId> = {id,..., _ord}).
 *
 * Why: whole-array set() writes let a device with a stale offline copy
 * erase every record it never saw (happened twice). Keyed children +
 * per-record update/remove make that structurally impossible.
 *
 * IMPORTANT SEQUENCING: the deployed web client must already be running
 * the keyed-format cloud-store (it reads both formats and self-migrates).
 * Running this script while OLD clients are open will break those tabs
 * until they reload the new code. Prefer: deploy first, ask admins to
 * refresh, then run this (or just let the new client self-migrate).
 *
 * Usage (from artifacts/api-server/, which has firebase-admin installed):
 *   node scripts/migrate-wolfion-keyed.mjs            # dry run (default)
 *   node scripts/migrate-wolfion-keyed.mjs --snapshot # snapshot only
 *   node scripts/migrate-wolfion-keyed.mjs --apply    # snapshot + migrate + verify
 *
 * A full pre-migration snapshot of /wolfion is always written to
 * ../../.local/state/wolfion-premigration-<ts>.json before any write.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import admin from "firebase-admin";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..", "..");
const SA_PATH = resolve(ROOT, ".local/state/firebase-sa.json");
const DB_URL =
  "https://wolfion-e0df3-default-rtdb.asia-southeast1.firebasedatabase.app";

const APPLY = process.argv.includes("--apply");
const SNAPSHOT_ONLY = process.argv.includes("--snapshot");

const sa = JSON.parse(readFileSync(SA_PATH, "utf8"));
admin.initializeApp({
  credential: admin.credential.cert(sa),
  databaseURL: DB_URL,
});
const db = admin.database();

const sanitizeKey = (id) => id.replace(/[.#$/[\]]/g, "_");
const isRecordArray = (v) =>
  Array.isArray(v) &&
  v.length > 0 &&
  v.every(
    (x) =>
      x != null &&
      typeof x === "object" &&
      !Array.isArray(x) &&
      typeof x.id === "string" &&
      x.id.length > 0,
  );
// String-list settings nodes (e.g. wolfion_yarn_types) stored as plain
// string arrays -> keyed { n, _ord } children (see toKeyedStringsObject /
// decodeKeyedStrings in artifacts/wolfion/src/lib/cloud-store.ts).
const STRING_LIST_KEYS = new Set(["wolfion_yarn_types"]);
const isStringArray = (v) =>
  Array.isArray(v) &&
  v.length > 0 &&
  v.every((x) => typeof x === "string");
const toKeyedStringsObject = (items) => {
  const out = {};
  items.forEach((s, i) => {
    const key = sanitizeKey(s);
    if (key.length === 0) return;
    if (!(key in out)) out[key] = { n: s, _ord: i };
  });
  return out;
};
const isKeyedStringsObject = (v) =>
  v != null &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  Object.keys(v).length > 0 &&
  Object.entries(v).every(
    ([k, c]) =>
      c != null &&
      typeof c === "object" &&
      !Array.isArray(c) &&
      typeof c.n === "string" &&
      sanitizeKey(c.n) === k,
  );
const isKeyedObject = (v) =>
  v != null &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  Object.entries(v).every(
    ([k, c]) =>
      c != null &&
      typeof c === "object" &&
      !Array.isArray(c) &&
      typeof c.id === "string" &&
      sanitizeKey(c.id) === k,
  );

const main = async () => {
  const rootSnap = await db.ref("wolfion").get();
  const data = rootSnap.val() ?? {};

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const snapPath = resolve(ROOT, `.local/state/wolfion-premigration-${ts}.json`);
  writeFileSync(snapPath, JSON.stringify(data, null, 2));
  console.log(`Snapshot of /wolfion saved: ${snapPath}`);
  if (SNAPSHOT_ONLY) return process.exit(0);

  for (const [key, val] of Object.entries(data)) {
    if (STRING_LIST_KEYS.has(key)) {
      if (isKeyedStringsObject(val)) {
        console.log(`SKIP  ${key}: already keyed strings (${Object.keys(val).length} entries)`);
        continue;
      }
      if (!isStringArray(val)) {
        console.log(`SKIP  ${key}: not a plain string array (${Array.isArray(val) ? "mixed array" : typeof val})`);
        continue;
      }
      const obj = toKeyedStringsObject(val.filter((s) => s != null));
      console.log(
        `${APPLY ? "MIGRATE" : "WOULD MIGRATE"} ${key}: ${val.length} strings -> ${Object.keys(obj).length} keyed entries`,
      );
      if (!APPLY) continue;
      await db.ref(`wolfion/${key}`).set(obj);
      await new Promise((r) => setTimeout(r, 10_000));
      const check = (await db.ref(`wolfion/${key}`).get()).val();
      if (!isKeyedStringsObject(check) || Object.keys(check).length !== Object.keys(obj).length) {
        console.error(`VERIFY FAILED for ${key} — a live client may have reverted the write. Close all Wolfion tabs and re-run.`);
        process.exitCode = 1;
      } else {
        console.log(`  verified: ${Object.keys(check).length} entries present`);
      }
      continue;
    }
    if (isKeyedObject(val) && !Array.isArray(val)) {
      console.log(`SKIP  ${key}: already keyed (${Object.keys(val).length} records)`);
      continue;
    }
    if (!isRecordArray(val)) {
      console.log(`SKIP  ${key}: not a record array (${Array.isArray(val) ? "array of non-records" : typeof val})`);
      continue;
    }
    const compact = val.filter((x) => x != null); // RTDB arrays can have null holes
    const obj = {};
    compact.forEach((rec, i) => {
      let k = sanitizeKey(rec.id);
      // Never silently drop a duplicate-id record.
      while (Object.prototype.hasOwnProperty.call(obj, k)) k = `${k}__dup`;
      obj[k] = { ...rec, _ord: i };
    });
    console.log(
      `${APPLY ? "MIGRATE" : "WOULD MIGRATE"} ${key}: ${compact.length} records -> ${Object.keys(obj).length} keyed children`,
    );
    if (!APPLY) continue;

    await db.ref(`wolfion/${key}`).set(obj);
    // Verify the write stuck (live clients have reverted admin writes before).
    await new Promise((r) => setTimeout(r, 10_000));
    const check = (await db.ref(`wolfion/${key}`).get()).val();
    if (!isKeyedObject(check) || Object.keys(check).length !== Object.keys(obj).length) {
      console.error(`VERIFY FAILED for ${key} — a live client may have reverted the write. Close all Wolfion tabs and re-run.`);
      process.exitCode = 1;
    } else {
      console.log(`  verified: ${Object.keys(check).length} children present`);
    }
  }
  process.exit(process.exitCode ?? 0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
