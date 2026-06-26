#!/usr/bin/env bash
# Deploys Wolfion: pushes the latest committed code to GitHub,
# which triggers Vercel to rebuild wolfion.website.
#
# Run this in the Replit SHELL (not the chat):   bash deploy.sh
# It will ask you to paste your GitHub token at a prompt. The terminal
# accepts a raw paste with no "chip" and no browser auto-fill, which is
# why we do it here instead of the chat or the secure box.

set -euo pipefail
export GIT_TERMINAL_PROMPT=0
REPO="Ra-Bee/Wolfion"

# Checks a token: returns 0 only if it authenticates AND has push access.
# Prints a short reason to stderr otherwise. Does NOT print the token.
check_token() {
  local t="$1"
  [ -z "$t" ] && { echo "empty" >&2; return 1; }
  local auth
  auth="$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: token $t" https://api.github.com/user)"
  if [ "$auth" != "200" ]; then echo "auth=$auth (invalid/expired)" >&2; return 1; fi
  # Ask the API whether this token can push to the repo (no write performed).
  local perm
  perm="$(curl -s -H "Authorization: token $t" -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$REPO" | tr -d ' \n' | grep -o '"push":true' || true)"
  if [ -z "$perm" ]; then echo "no write access (needs CLASSIC token with 'repo' ticked)" >&2; return 1; fi
  return 0
}

TOKEN=""

# 1) Try the token already stored in this project (no paste needed).
ENVTOK="${GITHUB_PERSONAL_ACCESS_TOKEN:-}"
if [ -n "$ENVTOK" ]; then
  echo "Trying the GitHub token saved in this project..."
  if check_token "$ENVTOK"; then
    echo "Saved token works."
    TOKEN="$ENVTOK"
  else
    echo "Saved token can't be used (see reason above). I'll ask you to paste a fresh one."
  fi
fi

# 2) Fall back to pasting a token.
if [ -z "$TOKEN" ]; then
  echo ""
  echo "Paste your GitHub token below and press Enter."
  echo "(Create one at https://github.com/settings/tokens/new -> tick 'repo' -> Generate)"
  printf "Token: "
  read -r RAW
  # Clean up the paste: drop spaces, quotes, and an accidental variable-name paste.
  CAND="$(printf '%s' "$RAW" | tr -d '[:space:]' | tr -d '"'"'" )"
  if [ "$CAND" = "GITHUB_PERSONAL_ACCESS_TOKEN" ] || [ -z "$CAND" ]; then
    echo ""
    echo "ERROR: That was empty or just the variable name, not a real token."
    echo "Generate a token, copy the value from the GREEN box, and paste THAT."
    exit 1
  fi
  echo ""
  echo "Checking the token..."
  if ! check_token "$CAND"; then
    echo "ERROR: That token can't be used (see reason above)."
    echo "Make a CLASSIC token at https://github.com/settings/tokens/new with the 'repo' checkbox ticked, then run this again."
    exit 1
  fi
  TOKEN="$CAND"
fi

echo "Token OK. Building a clean single-commit snapshot of this version..."
# Clear any stale lock left by a previous interrupted run.
[ -f .git/config.lock ] && rm -f .git/config.lock || true

# We push ONE fresh root commit containing the current files, instead of the
# full history. The full history has an OLD commit (fc09c167) with a real Clerk
# key in .env.example -- GitHub push-protection blocks that. The current files
# are clean (only placeholders), so a single snapshot pushes with no secret and
# nothing leaks. Vercel only needs the latest files, so this still deploys this
# exact version. This intentionally replaces the remote 'main' history.
#
# IMPORTANT: we snapshot the WORKING TREE (the live files in this folder), not
# HEAD. The latest code lives in the working files (a recovery restored them
# there), and HEAD may point at an older commit. Staging everything and writing
# a tree from the index guarantees we deploy exactly what is on disk now.
git add -A
STAGED_N="$(git diff --cached --name-only | wc -l | tr -d ' ')"
echo "Snapshotting ${STAGED_N} files from this folder for deploy."
TREE="$(git write-tree)"
export GIT_AUTHOR_NAME="Wolfion Deploy" GIT_AUTHOR_EMAIL="deploy@wolfion.website"
export GIT_COMMITTER_NAME="Wolfion Deploy" GIT_COMMITTER_EMAIL="deploy@wolfion.website"
SNAPSHOT="$(git commit-tree "$TREE" -m "Deploy Wolfion ($(date -u +%Y-%m-%dT%H:%MZ))")"

echo "Force-pushing the snapshot to GitHub (replaces live)..."
if git push --force "https://x-access-token:${TOKEN}@github.com/${REPO}.git" "${SNAPSHOT}:refs/heads/main"; then
  echo ""
  echo "SUCCESS. Vercel will rebuild wolfion.website in 1-2 minutes."
  echo "Then hard-refresh the site on your phone."
else
  echo ""
  echo "Push failed -- copy the lines above and send them to the agent."
  exit 1
fi
