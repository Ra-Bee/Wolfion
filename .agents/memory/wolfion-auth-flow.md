---
name: Wolfion auth flow decisions
description: Custom no-code sign-up via Clerk Backend API, legacy hooks import, and the accepted trade-offs.
---

# Wolfion auth flow

**Rule:** sign-up must NOT ask an email verification code (owner requirement). Clerk's hosted `<SignUp>` always forces the code, so Wolfion uses a custom sign-up page that POSTs to the api-server `/api/auth/signup`, which calls `clerkClient.users.createUser` — Backend-API-created users get their email marked **verified** automatically (tested) — then the client immediately signs in with `signIn.create({identifier,password})`.

**Why:** owner explicitly chose convenience over mailbox-ownership proof; review flagged the impersonation/abuse trade-off and it was accepted. Mitigations: 10/min/IP rate limit + `app.set("trust proxy", 1)` (Render proxy, else all clients share one bucket) + one retry around the post-create sign-in (propagation race).

**How to apply:** never swap the custom sign-up OR sign-in pages back to Clerk's hosted components — hosted `<SignIn>` can demand device-verification email codes AND its Google button uses a popup (`window.open`) that kicks Android WebView users to an external browser. Both pages use `signIn.authenticateWithRedirect` (stays in WebView) with callback at `/sign-in/sso-callback`, rendered via `<AuthenticateWithRedirectCallback>` from `@clerk/react`.

**SDK gotcha:** this repo's `@clerk/react` main entry exposes the new signals-based hooks (different return shapes). The classic custom-flow hooks (`useSignIn` with `isLoaded/setActive`, `attempt.status`) live at **`@clerk/react/legacy`**.

## Google login in the Android app (July 30, 2026 — v1.0.9)
Google blocks OAuth in WebViews, so the UA-override trick is dead. Current flow (do not revert):
- In-app Google button opens the SYSTEM browser (Capacitor Browser plugin via `window.Capacitor.Plugins`, no npm import — site is remote-loaded) at `/sign-in?handoff=app`.
- Browser: normal Clerk Google/password login, then POST `/api/auth/handoff` (Bearer session JWT) → Clerk sign-in token (300s, one-time) → redirect `wolfion://sso?ticket=…`.
- App: `DeepLinkSignIn` at App root redeems via `signIn.create({strategy:"ticket"})`; only accepts exact `wolfion://sso` links. Manifest has the `wolfion` scheme intent-filter; @capacitor/app + @capacitor/browser are in package.json (CI `cap sync` wires them natively — verify built APK's assets/capacitor.plugins.json when in doubt).
- `@clerk/react/legacy` exports ONLY useSignIn/useSignUp — no useAuth; get session tokens via `useClerk().session.getToken()` from the main entry.
- Known accepted risk: custom scheme can be squatted by another installed app (ticket is one-time + 5min so impact is low); verified https App Links would fix it but conflicts with the app loading wolfion.website in its webview.

## Password login without email codes (July 30, 2026)
Clerk (exact-peacock-22 prod pair on Render/Vercel) started returning `needs_second_factor` (email_code) on client password sign-ins even for fresh, verified accounts. Owner refuses any email codes.
Fix that works: server route `POST /api/auth/login` — Backend API `users.verifyPassword` + `createSignInToken` → client redeems `signIn.create({strategy:"ticket"})`; ticket sign-ins skip second factors. Client tries normal password sign-in first, falls back to the ticket path on `needs_second_factor`.
Debug gotcha: local CLERK_SECRET_KEY / VITE pk belong to a DIFFERENT instance than production (Render's keys = exact-peacock-22). Never test prod auth against the local instance's frontend API.

## App top safe-area (camera cutout)
Some phones report 0 for both env(safe-area-inset-top) AND the Capacitor --safe-area-inset-* vars, so headers sat under the camera. Fix: main.tsx adds `native-app` class on <html> when Capacitor-native; CSS floor `--native-safe-top-floor: 44px` folded into .safe-pt/.safe-pt-menu/pull-to-refresh via max(). Website unaffected.
