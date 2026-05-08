#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web / phone sessions. Local dev environments
# already have whatever the developer set up; we don't want to mutate them.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Project dependencies. Idempotent: a no-op once node_modules matches the lockfile.
npm install --no-audit --no-fund

# Vercel CLI for `vercel env pull`, `vercel dev`, `vercel deploy` without npx.
# Container state is cached after the hook completes, so this only really runs once.
if ! command -v vercel >/dev/null 2>&1; then
  npm install -g vercel@latest --no-audit --no-fund
fi
