#!/usr/bin/env bash
# RESTORE the previous live Wolfion site (the version with User List, Electricity,
# Rent, Investments, receipt scan, etc.) that was live before today's replace.
#
# Run this in the Replit SHELL (not the chat):   bash restore.sh
# It asks you to paste your GitHub token at a prompt.
#
# How it works: it fetches the exact previous-live commit from GitHub by its ID,
# then pushes a single clean snapshot of it back onto 'main'. Vercel rebuilds
# wolfion.website from it, bringing the old site back exactly as it was.
# NOTE: this replaces what is currently live (today's Replit overhaul). Your
# Replit still keeps that overhaul locally, so nothing is permanently lost.

set -euo pipefail
export GIT_TERMINAL_PROMPT=0
REPO="Ra-Bee/Wolfion"
# Commit 'main' pointed to immediately before today's replace (the old live site).
PREV="40066842200d9ea83c051f5becc6939c06177aa0"

echo "Paste your GitHub token below and press Enter."
echo "(Create one at https://github.com/settings/tokens/new -> tick 'repo' -> Generate)"
printf "Token: "
read -r RAW
TOKEN="$(printf '%s' "$RAW" | tr -d '[:space:]' | tr -d '"'"'" )"
if [ "$TOKEN" = "GITHUB_PERSONAL_ACCESS_TOKEN" ] || [ -z "$TOKEN" ]; then
  echo ""
  echo "ERROR: That was empty or just the variable name, not a real token."
  exit 1
fi

echo ""
echo "Checking the token..."
AUTH="$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: token $TOKEN" https://api.github.com/user)"
if [ "$AUTH" != "200" ]; then
  echo "ERROR: GitHub rejected this token (auth=$AUTH). Generate a brand-new one."
  exit 1
fi
WRITE="$(curl -s -o /dev/null -w '%{http_code}' -X PUT \
  -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$REPO/contents/package.json" \
  -d '{"message":"perm-probe-no-commit","content":"eA=="}')"
if [ "$WRITE" = "403" ]; then
  echo "ERROR: Token is valid but has NO write access. Make a CLASSIC token with 'repo' ticked."
  exit 1
fi

echo "Token OK. Fetching the previous live version from GitHub..."
[ -f .git/config.lock ] && rm -f .git/config.lock || true
URL="https://x-access-token:${TOKEN}@github.com/${REPO}.git"
if ! git fetch "$URL" "$PREV"; then
  echo ""
  echo "Could not fetch the old commit ($PREV)."
  echo "Copy these lines and send them to the agent."
  exit 1
fi

echo "Building a clean snapshot of the previous live version..."
TREE="$(git rev-parse "${PREV}^{tree}")"
export GIT_AUTHOR_NAME="Wolfion Restore" GIT_AUTHOR_EMAIL="deploy@wolfion.website"
export GIT_COMMITTER_NAME="Wolfion Restore" GIT_COMMITTER_EMAIL="deploy@wolfion.website"
SNAPSHOT="$(git commit-tree "$TREE" -m "Restore previous live version (pre-2026-06-25 replace)")"

echo "Force-pushing the restored version to GitHub..."
if git push --force "$URL" "${SNAPSHOT}:refs/heads/main"; then
  echo ""
  echo "SUCCESS. Your previous live site is being restored."
  echo "Vercel will rebuild wolfion.website in 1-2 minutes; then hard-refresh."
else
  echo ""
  echo "Push failed -- copy the lines above and send them to the agent."
  exit 1
fi
