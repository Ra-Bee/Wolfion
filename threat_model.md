# Threat Model

## Project Overview

Wolfion is a pnpm monorepo containing a React + Vite storefront/admin web app in `artifacts/wolfion`, a small Express 5 backend in `artifacts/api-server`, and shared libraries under `lib/` for the OpenAPI spec, generated client types, and a placeholder Drizzle/PostgreSQL layer. Authentication is handled with Clerk. The web app is also packaged as a Capacitor Android app under `artifacts/wolfion/android`.

Production scope for this scan is the Wolfion web app, the Express API server, the shared libraries they import, and the Capacitor Android wrapper. The mockup sandbox in `artifacts/mockup-sandbox` is treated as dev-only and out of scope unless future scans show a production path to it. Per deployment assumptions, `NODE_ENV` is `production`, TLS is platform-managed, and the mockup sandbox is never deployed.

## Assets

- **User accounts and authenticated sessions** — Clerk-managed identities and session cookies for customers and admins. Compromise would allow impersonation and access to account settings and any privileged UI.
- **Business/admin data shown by the app** — production, sales, inventory, labor, investment, debt, and profitability information surfaced through the admin UI. Even when stored client-side today, it is still sensitive business data.
- **Payment-related user input and saved payment labels** — the app collects checkout details and stores masked payment-method metadata in browser storage. This data is lower sensitivity than full PAN/CVC, but still privacy-relevant.
- **Application secrets and release credentials** — Clerk secret material, database connection strings, and any Android signing keys/passwords. Exposure can impact the backend or the integrity of distributed mobile releases.
- **Deployment and build integrity** — the mobile signing pipeline and published web bundle must not be forgeable by third parties.

## Trust Boundaries

- **Browser / mobile client to backend API** — all requests from the React app or Android WebView cross into `artifacts/api-server`; the client is untrusted.
- **Backend to Clerk** — `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts` forwards authentication traffic to Clerk using server-held secret material.
- **Backend to database** — `lib/db` is the trust boundary for any future persistence. SQL access must remain parameterized and server-controlled.
- **Unauthenticated to authenticated user boundary** — sign-in/sign-up routes are public; shop, settings, and checkout routes require a signed-in user.
- **Authenticated user to admin boundary** — admin views are selected from Clerk user email in the frontend and must never be treated as authoritative for protecting server-side data or actions.
- **Repository/build system to shipped Android app** — anything committed under `artifacts/wolfion/android` can affect the integrity of mobile releases.

## Scan Anchors

- **Production entry points**: `artifacts/wolfion/src/main.tsx`, `artifacts/wolfion/src/App.tsx`, `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/wolfion/android/app/src/main/**`
- **Highest-risk areas**: Clerk proxy middleware, frontend auth/role gating, browser/mobile local storage of business or payment-adjacent data, Android release-signing files and Gradle config
- **Public vs authenticated vs admin surfaces**:
  - Public: `/`, `/sign-in`, `/sign-up`, `/api/healthz`
  - Authenticated: `/shop`, `/products`, `/product/:id`, `/cart`, `/checkout-success`, `/about`, `/contact`, `/settings`
  - Admin UI: `/role-select`, `/admin-dashboard`, `/admin/*`
- **Usually dev-only and ignorable**: `artifacts/mockup-sandbox/**`, `attached_assets/**`, `downloads/**`; the `/dev-preview` route exists in the production app, so it should be reviewed briefly in future scans even though it is developer-oriented

## Threat Categories

### Spoofing

Clerk is the system of record for authentication, so the application must rely on validated Clerk identity for any protected capability. Any future backend endpoint that exposes user or admin data MUST validate the user server-side and MUST NOT trust frontend route guards, local storage, or UI mode selection alone.

### Tampering

The client stores cart state, masked payment-method labels, and substantial admin/business data in browser storage. That means any values read from local or session storage are attacker-controlled and MUST be treated as display-only unless independently validated server-side. Sensitive records that are meant to be session-bound MUST NOT rely on origin-wide persistent storage without explicit lifecycle controls such as logout scrubbing or platform backup exclusions. Build and release artifacts under the Android wrapper also matter here: tampering with signing configuration can change who is able to ship trusted updates.

### Information Disclosure

The backend must not leak Clerk secrets, cookies, authorization headers, or database credentials through logs or responses. The mobile and web builds must not embed private keys, signing credentials, or other release secrets in committed files. Business data shown in admin views and masked payment details stored on-device should be assumed readable by the local user and should not be treated as a secure secret store. If the app keeps sensitive operational records in browser or WebView storage, those records must be intentionally minimized and protected against unnecessary persistence such as surviving logout or being swept into device-backup flows.

### Denial of Service

The current backend surface is small, but any future public endpoints beyond `/api/healthz` and Clerk proxying should enforce reasonable request limits, body-size limits, and upstream timeouts. The app should avoid introducing unauthenticated, resource-intensive routes or background jobs without explicit throttling.

### Elevation of Privilege

Admin access is currently derived from a frontend-maintained email allowlist. That is acceptable only for gating client-side presentation. Any future privileged backend behavior, sensitive reads, or write operations MUST enforce authorization on the server and MUST NOT assume that a user is an admin because the frontend rendered admin routes. Release-signing credentials must also be protected, because anyone who gains them can effectively elevate themselves into a trusted software publisher for the Android app.
