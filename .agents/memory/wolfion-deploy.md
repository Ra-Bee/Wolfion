---
name: Wolfion deploy + agent git block
description: How Wolfion ships to wolfion.website, why the agent can't push, and the deploy.sh constraints that keep working.
---

# Wolfion deployment

**Pipeline:** push to `main` on github.com/Ra-Bee/Wolfion → Vercel auto-builds → wolfion.website (API on Render). No other deploy trigger.

**The agent is hard-blocked from all writing git operations** (push, fetch, merge, commit — even `git fetch`, which writes pack objects). Read-only git works with `--no-optional-locks`. Only the **user** can deploy, by running `deploy.sh` in their Shell (their shell is not blocked).
**Why:** token delivery via chat/secure-box kept failing (chat turns the paste into a secret-name chip; the secure box auto-fills a stale token). A terminal `read` prompt is the only clean channel.

**Token:** a classic PAT with `repo` scope, or a fine-grained PAT with Contents read **and write** (fine-grained default is read-only → 403 on push). `deploy.sh` probes auth + a no-commit PUT before pushing (200 auth, 422 = write OK, 403 = no write, 401 = invalid).

## deploy.sh must deploy a clean-root squash of the WORKING TREE
- Push a single squashed root commit of the on-disk tree via `git write-tree` + `git commit-tree` (no parents), then force-push to `main`. Set `GIT_AUTHOR_*`/`GIT_COMMITTER_*` or `commit-tree` errors on empty ident.
- **Snapshot the working tree, not HEAD** (`git add -A; TREE=$(git write-tree)`). Recoveries often live only in the working tree while HEAD points at an old commit, so deploying `HEAD^{tree}` would ship the wrong version.
- **Why clean-root:** a full-history force-push is blocked by GitHub secret scanning — old history contains a real Clerk `sk_test_` key in `.env.example` (GitHub mislabels it "Stripe Test API Secret Key"). The current tree is clean (placeholders only); a parent-less commit of just the current tree never exposes historical secrets, and Vercel only needs the latest files.

## Recovering lost work after a checkpoint rollback
A Replit rollback / "restore previous live site" can revert the working files to an OLD version (history is intact, working tree is not). **The finished overhaul = the last commit whose `wolfion-store.ts` still contains `computeShortSocksYarn`** (find via `git log --all -S computeShortSocksYarn -- <path>`). That commit already integrates both the overhaul and the electricity/rent/users-list/investments pages — no re-combine needed.
**Agent-safe recovery (no git writes):** `git --no-optional-locks archive <commit> -- artifacts/wolfion | tar -x` extracts that subtree over the working tree. Restore any api-server routes separately (they live outside artifacts/wolfion). Then typecheck wolfion + api-server.
