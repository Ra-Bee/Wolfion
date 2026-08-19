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
# Prints a plain-language reason to stderr otherwise. Does NOT print the token.
check_token() {
  local t="$1"
  [ -z "$t" ] && { echo "ERROR: Token is empty." >&2; return 1; }

  # Step 1 — does the token authenticate at all?
  local auth_status
  auth_status="$(curl -s -o /dev/null -w '%{http_code}' \
    -H "Authorization: token $t" https://api.github.com/user)"
  if [ "$auth_status" != "200" ]; then
    echo "ERROR: Token is invalid or expired (GitHub returned HTTP $auth_status)." >&2
    echo "       Make a fresh CLASSIC token at https://github.com/settings/tokens/new" >&2
    echo "       and tick the 'repo' checkbox before generating." >&2
    return 1
  fi

  # Step 2 — does the token have push access to this repo?
  # We fetch the repo metadata (read-only) and check the permissions block.
  local repo_body repo_status
  repo_body="$(curl -s -w '\n%{http_code}' \
    -H "Authorization: token $t" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$REPO")"
  repo_status="$(printf '%s' "$repo_body" | tail -n1)"
  repo_body="$(printf '%s' "$repo_body" | head -n -1)"

  case "$repo_status" in
    200)
      # Parse the push flag from the permissions object.
      local push_flag
      push_flag="$(printf '%s' "$repo_body" | tr -d ' \n' | grep -o '"push":true' || true)"
      if [ -z "$push_flag" ]; then
        echo "ERROR: Token is valid but does not have write (push) access to $REPO." >&2
        echo "       Make a CLASSIC token with the 'repo' checkbox ticked." >&2
        return 1
      fi
      ;;
    401|403)
      echo "ERROR: Token is valid but GitHub denied access to $REPO (HTTP $repo_status)." >&2
      echo "       Make a CLASSIC token with the 'repo' checkbox ticked." >&2
      return 1
      ;;
    404)
      echo "ERROR: Repository $REPO was not found (HTTP 404)." >&2
      echo "       The token may lack 'repo' scope, or the repository name is wrong." >&2
      return 1
      ;;
    *)
      echo "ERROR: Unexpected response from GitHub while checking repo access (HTTP $repo_status)." >&2
      echo "       Try again in a moment. If this keeps happening, paste the error to the agent." >&2
      return 1
      ;;
  esac

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

# --- Pre-flight check 1: uncommitted local changes ---
# The deploy pushes the files ON DISK (working tree), not your last commit.
# If files differ from your last local commit, they WILL be included -- make
# sure that's what you want, so a partial or unexpected state isn't deployed.
UNCOMMITTED="$(git diff --cached --name-status HEAD 2>/dev/null || true)"
if [ -n "$UNCOMMITTED" ]; then
  UN_N="$(printf '%s\n' "$UNCOMMITTED" | wc -l | tr -d ' ')"
  echo ""
  echo "NOTE: ${UN_N} file(s) on disk differ from your last local commit (uncommitted changes)."
  echo "The deploy pushes the files on disk, so ALL of these WILL be included:"
  printf '%s\n' "$UNCOMMITTED" | head -n 20 | sed 's/^A\t/  new:      /; s/^M\t/  modified: /; s/^D\t/  deleted:  /; s/^[A-Z][0-9]*\t/  changed:  /'
  if [ "$UN_N" -gt 20 ]; then echo "  ...and $((UN_N - 20)) more."; fi
  printf "Type 'yes' to include these uncommitted changes in the deploy, or anything else to cancel: "
  read -r INCLUDE_OK
  if [ "$INCLUDE_OK" != "yes" ]; then
    echo "Cancelled. Nothing was pushed. Commit or clean up your changes, then run this again."
    exit 0
  fi
fi

# --- Pre-flight check 2: compare what we're about to deploy with what is live now ---
# Fetch the current live commit from GitHub (read-only) and diff it against
# the snapshot we just staged. This shows exactly what this deploy changes.
echo ""
echo "Comparing with the version currently live on GitHub..."
REMOTE_OK=0
if git fetch --quiet "https://x-access-token:${TOKEN}@github.com/${REPO}.git" main 2>/dev/null; then
  REMOTE_OK=1
fi

if [ "$REMOTE_OK" = "1" ]; then
  # Diff live commit (FETCH_HEAD) -> staged snapshot (index).
  CHANGES="$(git diff --cached --name-status FETCH_HEAD 2>/dev/null || true)"
  if [ -z "$CHANGES" ]; then
    echo ""
    echo "WARNING: Nothing has changed since the last deploy."
    echo "The files you're about to push are identical to what is already live."
    printf "Type 'yes' to re-deploy anyway, or anything else to cancel: "
    read -r REDEPLOY
    if [ "$REDEPLOY" != "yes" ]; then
      echo "Cancelled. Nothing was pushed."
      exit 0
    fi
  else
    N_NEW="$(printf '%s\n' "$CHANGES" | grep -c '^A' || true)"
    N_MOD="$(printf '%s\n' "$CHANGES" | grep -c '^M' || true)"
    N_DEL="$(printf '%s\n' "$CHANGES" | grep -c '^D' || true)"
    N_OTHER="$(printf '%s\n' "$CHANGES" | grep -cv '^[AMD]' || true)"
    echo ""
    echo "Changes since the last deploy:"
    echo "  ${N_MOD} files modified, ${N_NEW} new, ${N_DEL} deleted."
    if [ "$N_OTHER" != "0" ]; then echo "  (${N_OTHER} other changes, e.g. renames)"; fi
    # Show up to 20 changed files so a partial/unexpected state is visible.
    echo ""
    printf '%s\n' "$CHANGES" | head -n 20 | sed 's/^A\t/  new:      /; s/^M\t/  modified: /; s/^D\t/  deleted:  /; s/^[A-Z][0-9]*\t/  changed:  /'
    TOTAL_LINES="$(printf '%s\n' "$CHANGES" | wc -l | tr -d ' ')"
    if [ "$TOTAL_LINES" -gt 20 ]; then
      echo "  ...and $((TOTAL_LINES - 20)) more."
    fi
  fi
else
  echo "Couldn't read the live version from GitHub (maybe first deploy)."
  echo "Skipping the change summary."
fi

echo ""
echo "Ready to deploy ${STAGED_N} files to wolfion.website."
echo "This will force-replace the live site on GitHub → Vercel."
printf "Type 'yes' and press Enter to continue, or anything else to cancel: "
read -r CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Cancelled. Nothing was pushed."
  exit 0
fi

echo ""
echo "Force-pushing the snapshot to GitHub (replaces live)..."
TREE="$(git write-tree)"
export GIT_AUTHOR_NAME="Wolfion Deploy" GIT_AUTHOR_EMAIL="deploy@wolfion.website"
export GIT_COMMITTER_NAME="Wolfion Deploy" GIT_COMMITTER_EMAIL="deploy@wolfion.website"
SNAPSHOT="$(git commit-tree "$TREE" -m "Deploy Wolfion ($(date -u +%Y-%m-%dT%H:%MZ))")"

if git push --force "https://x-access-token:${TOKEN}@github.com/${REPO}.git" "${SNAPSHOT}:refs/heads/main"; then
  echo ""
  echo "SUCCESS. Vercel will rebuild wolfion.website in 1-2 minutes."
  echo "Then hard-refresh the site on your phone."
else
  echo ""
  echo "Push failed -- copy the lines above and send them to the agent."
  exit 1
fi
