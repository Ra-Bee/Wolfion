# Firebase setup for Wolfion

This folder contains Firebase artefacts you must paste into the Firebase
console once. Replit does not deploy these for you.

## 1. Realtime Database security rules

1. Open https://console.firebase.google.com → project **wolfion-e0df3**.
2. Left sidebar → **Realtime Database** → top tabs → **Rules**.
3. Replace the entire contents with the JSON from `database.rules.json`
   in this folder.
4. Click **Publish**.

These rules:

- Deny all anonymous reads and writes at the root.
- Allow read + write under `/wolfion` only when the requesting user
  signed in with a Firebase custom token that carries the
  `admin: true` claim. That claim is minted by the
  `POST /api/firebase/token` endpoint after verifying the Clerk
  session and matching the user's email against the server-side
  admin allow-list (`artifacts/api-server/src/lib/admin.ts` →
  `ADMIN_EMAILS`).

To add a new admin: add their email to `ADMIN_EMAILS` in
`artifacts/api-server/src/lib/admin.ts` **and** the matching list in
`artifacts/wolfion/src/lib/admin.ts`. The rules file does not need
to change.
