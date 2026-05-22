# Wolfion

Premium socks brand storefront + production-tracking admin dashboard.

- **Frontend:** React + Vite + TailwindCSS + Wouter, packaged as a PWA
  and an Android TWA via PWABuilder.
- **Backend:** Express 5 (Node 24), Clerk auth, Firebase Admin for
  custom-token minting.
- **Realtime sync:** Firebase Realtime Database (admin data is
  cross-device, sub-second).
- **Auth:** Clerk (login UI + session) bridged to Firebase Auth
  custom tokens for RTDB rules.
- **Database:** Firebase RTDB for admin data; product catalog in
  Firebase (Phase 2 of the migration replaces the legacy Postgres
  catalog).
- **Monorepo:** pnpm workspaces.

## Structure

```
artifacts/
  wolfion/          # React + Vite web app (deploys to Vercel)
  api-server/       # Express API (deploys to Render via Dockerfile)
  uniless/          # RabChat mobile app (Expo) — separate product
  mockup-sandbox/   # Internal design preview tool
lib/                # Shared libraries (db schemas, api-zod, etc.)
scripts/            # One-off utility scripts
```

## Local development

```bash
# Install everything (uses Node 24 + pnpm 10 via corepack)
corepack enable
pnpm install

# Run the API
cp artifacts/api-server/.env.example artifacts/api-server/.env
# (fill in CLERK_* + FIREBASE_SERVICE_ACCOUNT + WOLFION_ADMIN_EMAILS)
pnpm --filter @workspace/api-server run dev

# Run the web app (separate terminal)
cp artifacts/wolfion/.env.example artifacts/wolfion/.env.local
# (fill in VITE_CLERK_PUBLISHABLE_KEY + VITE_FIREBASE_API_KEY)
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/wolfion run dev
```

The web app expects `/api/*` to reach the backend. Either run the API
on `localhost:8080` and add a Vite dev-server proxy, or set
`VITE_API_BASE_URL=http://localhost:8080` in `.env.local`.

## Deployment

See [`MIGRATION.md`](./MIGRATION.md) for the full off-Replit deployment
checklist (Clerk → Vercel → Render → Firebase). One-time setup, ~1h.

## Useful commands

- `pnpm run typecheck` — typecheck everything
- `pnpm --filter @workspace/wolfion run build` — production web build
- `pnpm --filter @workspace/api-server run build` — esbuild bundle

## License

Private / proprietary. © Wolfion.
