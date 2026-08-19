# Wolfion daily backups & restore

A GitHub Action (`.github/workflows/wolfion-daily-backup.yml`) snapshots the
entire `/wolfion` tree of the Firebase Realtime Database **every day at
21:30 UTC (~03:30 Dhaka)** and commits it to the **`backups` branch** of
`Ra-Bee/Wolfion` as `backups/wolfion-YYYY-MM-DD.json`. Snapshots older than
**30 days** are pruned automatically.

You can also run it on demand: GitHub → Actions → "Wolfion daily RTDB backup"
→ Run workflow.

It needs one repository secret: `FIREBASE_SERVICE_ACCOUNT_JSON` (the full
Firebase service-account key JSON).

## Restore how-to

1. **Find the snapshot** — on GitHub switch to the `backups` branch, open
   `backups/`, download the file from the last known-good day.

2. **Close every open Wolfion tab/app first.** A live client can revert an
   admin write within seconds (this happened during a past recovery).

3. **Restore a single key** (usual case — one list got wiped). From the
   Replit workspace, in `artifacts/api-server/` (has `firebase-admin`;
   service-account key at `.local/state/firebase-sa.json`):

   ```js
   // node restore-key.mjs <snapshot.json> <storageKey>
   import { readFileSync } from "fs";
   import admin from "firebase-admin";
   admin.initializeApp({
     credential: admin.credential.cert(JSON.parse(readFileSync("../../.local/state/firebase-sa.json", "utf8"))),
     databaseURL: "https://wolfion-e0df3-default-rtdb.asia-southeast1.firebasedatabase.app",
   });
   const [snapPath, key] = process.argv.slice(2);
   const snap = JSON.parse(readFileSync(snapPath, "utf8"));
   await admin.database().ref(`wolfion/${key}`).set(snap[key]);
   console.log("restored", key);
   process.exit(0);
   ```

4. **Verify the write stuck** — re-read the key 10–30 s later (a stale client
   may have overwritten it again):

   ```js
   const val = (await admin.database().ref(`wolfion/${key}`).once("value")).val();
   ```

5. **Full restore** (everything wiped): same as step 3 but
   `ref("wolfion").set(snap)` — only do this if you are sure the snapshot is
   newer than everything currently in the DB, since it overwrites the whole
   tree.

Note: record lists are stored keyed-per-record (`/wolfion/<key>/<recordId>`
with an `_ord` field); the snapshots preserve that structure as-is, so a
restored key drops back in the exact same format.
