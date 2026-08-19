---
name: Wolfion RTDB data recovery
description: How to inspect/restore Wolfion Firebase RTDB data, why whole-array writes cause stale-tab data loss, and where backups live.
---

# Wolfion Firebase RTDB recovery

**Admin access:** service-account JSON at `.local/state/firebase-sa.json` (the `FIREBASE_SERVICE_ACCOUNT` secret holds a web API key, NOT the SA JSON — use the file). Run scripts from `artifacts/api-server/` (has `firebase-admin` installed; ESM `await import` fails from /tmp). DB URL: `https://wolfion-e0df3-default-rtdb.asia-southeast1.firebasedatabase.app`, data under `/wolfion/<storageKey>`.

**Loss mechanism:** every store key is a whole JSON array written with `set()`. A stale open tab (deployed wolfion.website or preview) that flushes a pending write or does any edit overwrites the entire array with its old copy — losing everything added since that tab last synced. This happened to `wolfion_daily_production_entries` (lost Jun 26–Jul 5, 2026) while `wolfion_production_entries` survived. A live client even reverted the first restore write within ~1s; the second attempt held.

**How to apply:** After any admin-SDK write, re-read after 10–30s to confirm it stuck; tell the user to close/refresh all open Wolfion tabs first.

**Restore recipe:** daily entries are reconstructable from `wolfion_production_entries` via `sourceDailyId` links. Cost formula (matches `handleAddDailyEntry`): packaging 5/dz, iron 10/dz, labor(overhead) 29.5/dz, yarn from product config recipe (grams/dz × date-effective purchase price, lb→kg ÷0.45359237). Football pairs sharing one plain sourceDailyId → create daily halves `${id}__ft`/`${id}__fb` and re-point production links (matches split-migration convention).

**Backups:** pre-restore cloud snapshots saved at `.local/state/wolfion-restore-backup-*.json`; full snapshots at `.local/state/wolfion-snapshot-*.json`.

**Keyed-children format (Jul 30, 2026):** record lists are now stored as per-record children `/wolfion/<key>/<recordId>` with an `_ord` order field; `useCloudStored` reads both formats, self-migrates a legacy array on the first authenticated snapshot, and writes per-record `update()` diffs where deletions are only issued for ids seen in the latest cloud snapshot — a stale device structurally cannot erase unseen records. Non-record values (scalars, cost-inputs object, yarnPerDozen, yarnTypes string[]) still use whole-value `set()`. Server-side converter: `artifacts/api-server/scripts/migrate-wolfion-keyed.mjs` (dry-run default, `--apply` writes; only run AFTER the new client is deployed and old tabs closed, or old clients crash/revert it). `/wolfion/products` is the API-server catalog, not a useCloudStored key — leave it alone.

**Second wipe (found Jul 30, 2026) + guard now in place:** the trigger was the dashboard retro-recompute effect running on a stale localStorage mirror before the first cloud snapshot, then set()-ing the whole stale array. Fixes: `useCloudStored` now queues ALL writes until the first authoritative snapshot (`cloudReadyRef`, reset on every resubscribe) and flushes them merged-by-id with the cloud copy (pending wins per id, unseen cloud records preserved; synced flag only set after the flush write succeeds); the dashboard recompute is additionally gated on the cloudReady of dailyEntries/productConfigs/yarnPurchases. Known trade-off: a delete made pre-sync can resurrect; non-id-array keys (scalars/objects) still overwrite wholesale on flush. Any NEW auto-write effect must be gated on cloudReady.
