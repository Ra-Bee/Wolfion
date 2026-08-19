---
name: Wolfion GitHub push
description: How to push to github.com/Ra-Bee/Wolfion — working token key, history divergence, and the force-push protection quirk.
---

# Pushing to github.com/Ra-Bee/Wolfion

## Working token
- The secret `GITHUB_PERSONAL_ACCESS_TOKEN` is **expired** — GitHub returns 401.
- The working token is stored under `NEW__GITHUB_PERSONAL_ACCESS_TOKEN`.
- **Why:** the original token lapsed; the user re-added a fresh one under a new key
  rather than overwriting the old one.
- **How to apply:** authenticate pushes with
  `https://x-access-token:${NEW__GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/Ra-Bee/Wolfion.git`.
  Pass inline only — never write the token into `.git/config`, never print its value.
  The `origin` remote still stores a placeholder token, so plain `git push origin` fails.

## Force-push is blocked outside isolated task envs
- History-rewriting git ops (force push, merge of unrelated histories, rebase, reset)
  are blocked by the workspace git protection layer — in the main agent's tools AND in
  the interactive Shell tab. A user running `git push --force` in the Shell also fails.
- **Why:** gitsafe protection guards the main branch/environment.
- **How to apply:** to force-push or otherwise rewrite history, do it from a background
  Project Task's isolated environment, which is permitted. Do not keep retrying in the
  main agent or telling the user to run it in the Shell.

## History note (as of 2026-07)
- Local Replit history and the GitHub repo had **unrelated histories** (no common
  ancestor). Remote had a single auto-generated "Deploy Wolfion" snapshot commit; local
  had the real granular dev history. Resolved by force-overwriting remote main with local
  (user's explicit choice). Future pushes are normal fast-forwards from here.

## Remote diverges (July 31, 2026)
- Task agents and workflow runs also push to Ra-Bee/Wolfion main, so remote regularly has commits the workspace lacks. Always `git fetch` + normal merge before pushing; normal (non-force) merges/pushes are allowed from the main agent. Conflict rule of thumb: keep local for shop/dev-preview code, take remote for auth/Android/workflow files, then re-check that every page remote references (e.g. `/app-sso`) is actually routed in App.tsx.

## Workflow files & APK builds (July 30, 2026)
- `NEW__GITHUB_PERSONAL_ACCESS_TOKEN` has only `repo` scope: any git tree containing a `.github/workflows/*` change fails with a misleading **404 on POST /git/trees**. Use `GITHUB_WORKFLOW_TOKEN` (has `workflow` scope) for pushes that touch workflow files.
- The release workflow now runs `bundleRelease assembleRelease` and uploads both `wolfion-release-aab` and `wolfion-release-apk` artifacts.
- Release APKs are v2-signed: `keytool -printcert -jarfile` says "Not a signed jar" (v1 only). Verify by finding the `APK Sig Block 42` magic in the file instead.
