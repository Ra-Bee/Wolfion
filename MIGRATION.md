# Migration off Replit — Wolfion

This is the **complete checklist** for moving Wolfion from Replit to
GitHub + Vercel (web) + Render (API) + Firebase (data + auth bridge).

Estimated time: **~1 hour of clicking around**, plus my code changes
in 2 follow-up sessions.

---

## Phase 1 — Repo is deployment-ready ✅ (already done)

Files added in this commit:

- `README.md`, `MIGRATION.md` — project docs
- `.gitignore` — covers `.env*`, build outputs, Android keystores,
  Replit-internal folders
- `artifacts/wolfion/.env.example` — frontend env contract
- `artifacts/wolfion/vercel.json` — Vercel build + SPA rewrites +
  cache headers
- `artifacts/api-server/.env.example` — backend env contract
- `artifacts/api-server/Dockerfile` — multi-stage Docker build
- `render.yaml` — one-click Render Blueprint

The Replit-specific files (`.replit`, `artifact.toml`, `replit.nix`)
are intentionally **left in place** so the app keeps running on
Replit during the migration. Delete them only after the new hosts
are confirmed working.

---

## Phase 2 — Your one-hour setup (do these in order)

### Step 1 — Push to GitHub

Your repo: <https://github.com/Ra-Bee/Wolfion>

In the Replit shell:

```bash
git remote add origin https://github.com/Ra-Bee/Wolfion.git
git branch -M main
git push -u origin main
```

If `origin` already exists, replace it:

```bash
git remote set-url origin https://github.com/Ra-Bee/Wolfion.git
git push -u origin main
```

---

### Step 2 — Create your own Clerk account (~10 min)

Today your login uses Replit's shared Clerk tenant. It dies when you
leave Replit. You need your own.

1. Sign up at <https://dashboard.clerk.com> (free tier is plenty).
2. **Create application** → pick a name (e.g. "Wolfion").
3. Enable the sign-in methods you want (Email + Google recommended).
4. Go to **API Keys** and copy:
   - `Publishable key` → starts with `pk_test_…` or `pk_live_…`
   - `Secret key` → starts with `sk_test_…` or `sk_live_…`
5. In **User & Authentication → Email, Phone, Username**, enable
   email so the email-allowlist on the backend works.
6. Save both keys somewhere safe — you'll paste them into Vercel and
   Render in the next steps.

After you have the keys, ping me and I'll do the code swap (Phase 3
below). Until then, keep using the current login.

---

### Step 3 — Verify Firebase is yours (~2 min)

Open <https://console.firebase.google.com> → your project.

Confirm you have access to:

- **Project Settings → General** — `Web API Key`
- **Project Settings → Service Accounts** — "Generate new private key"
  (this gives you `firebase-admin.json` for the backend)
- **Realtime Database → Rules** — for pasting the rules file later

If the project is already yours: nothing to do. If it's a
Replit-managed project: create your own at <https://console.firebase.google.com>,
enable Realtime Database + Authentication (Custom token sign-in
method), then ping me and I'll do the schema/key swap.

---

### Step 4 — Render account for the backend (~5 min)

1. Sign up at <https://render.com> with your GitHub.
2. **New → Blueprint** → pick the `Wolfion` repo.
3. Render reads `render.yaml` and proposes a service named
   `wolfion-api`. Confirm.
4. When prompted for env vars, paste:
   - `CLERK_PUBLISHABLE_KEY` — from Clerk dashboard
   - `CLERK_SECRET_KEY` — from Clerk dashboard
   - `FIREBASE_SERVICE_ACCOUNT` — the WHOLE JSON content of your
     Firebase service-account key, on ONE line. Tip: open the JSON
     file in VS Code, `Cmd/Ctrl-A`, then format → minify.
   - `WOLFION_ADMIN_EMAILS` — `you@example.com,co-admin@example.com`
   - `CORS_ORIGIN` — leave blank for now; come back after Step 5.
   - `GROQ_API_KEY` — only if you use the AI assistant.
5. Deploy. Wait for green. Note the URL (e.g.
   `https://wolfion-api.onrender.com`).
6. Test: `curl https://wolfion-api.onrender.com/api/healthz`
   → should print `{"status":"ok"}`.

> **Free tier note:** Render's free plan sleeps after 15 min idle.
> First request after sleep takes ~30s. Upgrade to Starter ($7/mo)
> for always-on.

---

### Step 5 — Vercel account for the frontend (~5 min)

1. Sign up at <https://vercel.com> with your GitHub.
2. **Add New → Project** → pick `Wolfion` repo.
3. **Root Directory:** `artifacts/wolfion`. Framework Preset: **Other**.
   (Vite is auto-detected via `vercel.json`.)
4. **Environment Variables** (Production + Preview + Development):
   - `VITE_CLERK_PUBLISHABLE_KEY` — your Clerk publishable key
   - `VITE_FIREBASE_API_KEY` — Firebase web API key
5. **Important:** open `artifacts/wolfion/vercel.json` and change the
   line `https://wolfion-api.onrender.com/api/$1` to your actual
   Render URL from Step 4. Commit and push.
6. Deploy. Note the URL (e.g. `https://wolfion.vercel.app`).
7. Go back to **Render → wolfion-api → Environment** and set
   `CORS_ORIGIN=https://wolfion.vercel.app`. Save (triggers redeploy).
8. Go back to **Clerk → Domains** and add your Vercel domain so Clerk
   accepts logins from it.

---

### Step 6 — Update Firebase RTDB rules

1. Open **Firebase Console → Realtime Database → Rules**.
2. Paste the contents of `artifacts/wolfion/firebase/database.rules.json`.
3. Publish.

---

### Step 7 — Smoke test

- Open `https://wolfion.vercel.app`.
- Log in with an admin email.
- Add a product on one browser, open another browser, confirm it
  appears within ~1 second.

If anything fails, **don't panic** — your Replit deploy is still live
in parallel. Tell me which step broke and I'll dig in.

---

## Phase 3 — Code swap (I do these once you finish Phase 2)

Tell me when Clerk + Render + Vercel + Firebase are all set up. Then
in 1–2 follow-up sessions I'll:

1. **Swap Clerk** — remove the Replit `/__clerk` proxy middleware
   and the `VITE_CLERK_PROXY_URL` codepath. Your own Clerk publishable
   key handles auth directly.
2. **Migrate products Postgres → Firebase** — the shop catalog (the
   only Postgres data) moves into Firebase RTDB. Backend stops needing
   `DATABASE_URL`. Drop `@workspace/db`, `drizzle-orm`, `pg` from the
   API server.
3. **Strip Replit Vite plugins** — remove `@replit/vite-plugin-*` from
   `artifacts/wolfion/vite.config.ts` and `package.json` so the build
   doesn't pull them on Vercel.
4. **Auto-deploy** — every `git push` to `main` deploys to Vercel +
   Render automatically. Replit becomes a development sandbox.

---

## Phase 4 — Decommission Replit (only after Phase 3 is stable)

Once the Vercel + Render setup has been running smoothly for a few
days:

```bash
git rm .replit replit.nix .replitignore replit.md
git rm -rf artifacts/wolfion/.replit-artifact artifacts/api-server/.replit-artifact
git commit -m "decommission replit"
git push
```

The repo is now fully independent.

---

## Costs (free-tier reality)

| Service | Free tier | Upgrade-when |
|---------|-----------|--------------|
| GitHub | unlimited | never (private repos free) |
| Vercel | 100 GB bandwidth/mo, 6k build min/mo | high-traffic shop |
| Render | 750 hrs/mo BUT sleeps after 15min | when sleep latency bothers you ($7/mo) |
| Firebase | 1 GB RTDB, 10 GB/mo download | when admin data gets very heavy |
| Clerk | 10,000 monthly active users | when you grow past 10k MAU |

Total cost at small/medium scale: **$0–$7/mo**.
