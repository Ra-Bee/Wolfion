# Wolfion — full setup guide for a fresh machine / new host

This bundle is a complete copy of the Wolfion socks-shop monorepo. It
contains the React + Vite admin and customer site, the Express API
server, the Firebase Realtime Database rules, and the OpenAPI / Drizzle
schemas. It does **not** contain `node_modules`, build output, secrets,
or the local Firebase service-account file — those are recreated below.

Stack overview:
- **Frontend** — React 19 + Vite + Tailwind + Clerk + Firebase Web SDK
- **Backend** — Express 5 + Clerk + Firebase Admin + Drizzle ORM
- **Database** — Firebase Realtime Database (admin state) + optional Postgres
- **Auth** — Clerk (your own account)
- **Hosting** — Vercel (frontend) + Render (api-server)

---

## 1. Prerequisites

Install on the new machine:
- **Node.js 24** (use `nvm install 24 && nvm use 24`)
- **pnpm 10+** (`npm i -g pnpm`)
- A free account on:
  - GitHub (to host the code)
  - Vercel (frontend hosting)
  - Render (backend hosting)
  - Firebase / Google Cloud (database + auth bridge)
  - Clerk (user authentication)

---

## 2. Install dependencies

```bash
pnpm install
```

This installs every workspace package (artifacts/* + lib/*).

---

## 3. Create the third-party accounts

### 3a. Clerk (login / signup)
1. Go to https://dashboard.clerk.com and create a new application.
2. In **API Keys** copy:
   - Publishable key → goes into `VITE_CLERK_PUBLISHABLE_KEY` and
     `CLERK_PUBLISHABLE_KEY`
   - Secret key → goes into `CLERK_SECRET_KEY`
3. In **User & Authentication → Email, Phone, Username**, enable Email +
   Password (or whatever providers you want).
4. After your first signup, open **Users** in the Clerk dashboard and
   note your user's email. Add it to
   `artifacts/api-server/src/lib/admin.ts` → `ADMIN_EMAILS` so the server
   recognises you as an admin and will mint Firebase admin tokens.

### 3b. Firebase (cloud database)
1. Go to https://console.firebase.google.com and create a new project.
2. **Build → Authentication → Get started**. (No providers needed — the
   server mints custom tokens.)
3. **Build → Realtime Database → Create database**. Pick a region.
4. **Project settings → General → Your apps → Web (`</>`)**. Register an
   app, copy the `apiKey` value → goes into `VITE_FIREBASE_API_KEY`.
5. Open `artifacts/wolfion/src/lib/firebase.ts` and update
   `FIREBASE_PROJECT_ID`, `FIREBASE_DATABASE_URL`, `authDomain`,
   `storageBucket`, `messagingSenderId`, `appId` to your project's values
   (you can find them all in the same Project settings page).
6. Open `artifacts/api-server/src/lib/firebase.ts` and update the same
   two constants (project id + database url).
7. **Project settings → Service accounts → Generate new private key**.
   Download the JSON file. Either:
   - Paste the *entire* JSON file contents into the
     `FIREBASE_SERVICE_ACCOUNT` env var (single line), or
   - Save it to `.local/state/firebase-sa.json` for local dev — the
     server auto-detects it.
8. Deploy the RTDB security rules:
   - Open **Realtime Database → Rules** in the Firebase console
   - Paste the contents of
     `artifacts/wolfion/firebase/database.rules.json`
   - Click Publish

### 3c. Postgres (optional — legacy /api/products seed)
The admin dashboard no longer needs Postgres. Skip this section unless
you want the customer-facing product catalog `/api/products` endpoint
to work. If you do: create any managed Postgres instance (Neon, Render,
Supabase, etc.) and set `DATABASE_URL`.

---

## 4. Configure environment variables

Copy `.env.example` to `.env` at the repo root and fill in values.

For local dev, pnpm loads vars from the shell. The simplest way:

```bash
export $(grep -v '^#' .env | xargs)
```

For Vercel: set every `VITE_*` and `CLERK_PUBLISHABLE_KEY` in
**Project Settings → Environment Variables** for Production, Preview
and Development.

For Render: set every server-side var (`CLERK_SECRET_KEY`,
`FIREBASE_SERVICE_ACCOUNT`, `SESSION_SECRET`, `NODE_ENV=production`,
`PORT=10000` or your choice) in the service's Environment tab.

---

## 5. Run locally

Two terminals:

```bash
# Terminal 1 — API server (port 8080 by default)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Wolfion web app (port 5173 by default)
pnpm --filter @workspace/wolfion run dev
```

Visit http://localhost:5173. Sign in with the email you put in
`ADMIN_EMAILS`. The "Cloud sync on" pill in the admin menu should turn
green within a couple of seconds.

---

## 6. Deploy

### 6a. Push to GitHub
```bash
git init
git add .
git commit -m "import wolfion"
git branch -M main
git remote add origin git@github.com:YOUR_USER/YOUR_REPO.git
git push -u origin main
```

### 6b. Vercel (frontend)
1. Import the GitHub repo at https://vercel.com/new.
2. Framework preset: **Other**.
3. **Root directory**: `artifacts/wolfion`.
4. Build command: `pnpm install && pnpm --filter @workspace/wolfion run build`
5. Output directory: `dist/public`.
6. Add the env vars from step 4.
7. Once it deploys, attach your custom domain (e.g. `yourdomain.com`).

The included `artifacts/wolfion/vercel.json` rewrites `/api/*` to the
Render backend URL — edit it to point at *your* Render service after
step 6c.

### 6c. Render (backend)
1. **New → Web Service** at https://dashboard.render.com.
2. Connect the same GitHub repo.
3. Use the included `render.yaml` (Render auto-detects it) or set
   manually:
   - Build command: `pnpm install && pnpm --filter @workspace/api-server run build`
   - Start command: `pnpm --filter @workspace/api-server run start`
4. Add server-side env vars from step 4.
5. Copy the Render URL (looks like `https://yourapp.onrender.com`) and
   paste it into `artifacts/wolfion/vercel.json` as the destination of
   the `/api/*` rewrite. Commit & push so Vercel rebuilds.

---

## 7. Files you can safely delete if you no longer use Replit

This repo was originally built on Replit. These are Replit-specific and
have no effect on Vercel/Render builds; they only run when REPL_ID is
set in the environment:

- `.replit`
- `.replitignore`
- `replit.nix`
- `replit.md`
- `.local/`
- `.agents/`
- `.cache/`
- `artifacts/*/.replit-artifact/` (artifact registry)
- The three `@replit/vite-plugin-*` entries in
  `artifacts/wolfion/package.json` (they're only loaded when REPL_ID is
  set, so leaving them in is harmless).

---

## 8. Troubleshooting

- **"Cloud offline: Sign in required"** — your email isn't in
  `ADMIN_EMAILS`, or the Clerk publishable key in the browser doesn't
  match the secret key on the server.
- **"Firebase: Error (auth/configuration-not-found)"** — open the
  Firebase console → Authentication → click "Get started" once.
- **Writes don't sync between devices** — the RTDB security rules
  weren't deployed. Re-do step 3b-8.
- **Vercel build fails on `vite build`** — make sure
  `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_FIREBASE_API_KEY` are set in
  Vercel project settings for *all* environments (Production +
  Preview + Development).
