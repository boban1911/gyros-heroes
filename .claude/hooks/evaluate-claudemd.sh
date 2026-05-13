#!/usr/bin/env bash
# Stop hook: nudges Claude at the end of any turn that modified non-doc source
# files. Asks for a brief evaluation of whether CLAUDE.md or docs/*.md need
# updates, based only on what was just changed.
#
# Quiet by design: skips discussion-only turns, doc-only turns, and avoids
# re-firing if the same set of files is still pending from a previous turn.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[ -z "$REPO_ROOT" ] && exit 0
cd "$REPO_ROOT"

STATE_FILE=".claude/.claudemd-eval-state"
mkdir -p "$(dirname "$STATE_FILE")"

# Files changed vs HEAD, plus untracked-but-not-ignored. Excludes:
# - CLAUDE.md and docs/*.md (changes there shouldn't recursively prompt)
# - .claude/ (hook config and state)
# - lockfiles and env files (not conceptual changes worth documenting)
CHANGED=$(
  {
    git diff --name-only HEAD 2>/dev/null || true
    git ls-files --others --exclude-standard 2>/dev/null || true
  } | sort -u
)

SIGNIFICANT=$(echo "$CHANGED" | grep -vE '^(CLAUDE\.md|docs/|\.claude/|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|\.env)' | sed '/^$/d' || true)

if [ -z "$SIGNIFICANT" ]; then
  exit 0
fi

# De-dupe: if the same set of files was already evaluated, don't re-prompt.
HASH=$(echo "$SIGNIFICANT" | shasum | cut -d' ' -f1)
PREV_HASH=$(cat "$STATE_FILE" 2>/dev/null || echo "")
if [ "$HASH" = "$PREV_HASH" ]; then
  exit 0
fi
echo "$HASH" > "$STATE_FILE"

# Emit a Stop-hook "block" decision. Claude continues with the reason as
# context, evaluates, edits docs if warranted, then ends the turn normally.
FILES_LIST=$(echo "$SIGNIFICANT" | sed 's/^/  - /')

cat <<EOF
{
  "decision": "block",
  "reason": "Self-check before ending the turn. Source files changed:\n${FILES_LIST//$'\n'/\\n}\n\nEvaluate whether CLAUDE.md or any docs/*.md need updates to reflect new invariants, file paths, env vars, conventions, or gotchas introduced by these changes. Base this only on what you just changed — do not re-explore the codebase. If updates are warranted, edit the relevant doc(s) now. If not, reply 'No doc updates needed' in one line and stop. Don't re-run this evaluation if you already addressed it this turn."
}
EOF
