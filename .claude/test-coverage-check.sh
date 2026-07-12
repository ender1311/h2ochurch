#!/usr/bin/env bash
# PostToolUse hook: nudges Claude to write tests when API routes are added/modified,
# and regression tests when raw SQL appears in a page/server component.
# Receives Claude Code tool-use event JSON on stdin.

FILE=$(jq -r '.tool_input.file_path // .tool_input.new_path // ""' 2>/dev/null)

# Nothing to check if we didn't get a file path
if [[ -z "$FILE" ]]; then
  exit 0
fi

REPO=$(git rev-parse --show-toplevel 2>/dev/null)
if [[ -z "$REPO" ]]; then
  exit 0
fi

# ── API route handler → require an integration test ───────────────────────────
if echo "$FILE" | grep -qE 'src/app/api/.+/route\.(ts|js)$'; then
  ROUTE_NAME=$(echo "$FILE" | sed -E 's|.*src/app/api/([^/]+)/.*|\1|')

  INTEGRATION_DIR="$REPO/tests/integration"
  if [[ -d "$INTEGRATION_DIR" ]]; then
    MATCH=$(ls "$INTEGRATION_DIR" 2>/dev/null | grep -i "$ROUTE_NAME" | head -1)
  else
    MATCH=""
  fi

  if [[ -z "$MATCH" ]]; then
    printf '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"[test-coverage] No integration test found for %s. Write one in tests/integration/ before this session ends. Route name to match: %s"}}\n' "$FILE" "$ROUTE_NAME"
  fi

  exit 0
fi

# ── Page / server component with raw SQL → require a regression test ──────────
if echo "$FILE" | grep -qE 'src/app/.+/page\.(tsx|jsx)$'; then
  FULL_PATH="$REPO/$FILE"
  if [[ ! -f "$FULL_PATH" ]]; then
    FULL_PATH="$FILE"
  fi

  if [[ -f "$FULL_PATH" ]] && grep -qE '\$queryRaw|queryRawUnsafe|sql`' "$FULL_PATH"; then
    printf '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"[test-coverage] %s uses raw SQL. Add a regression test in tests/regression/ that exercises the exact SQL column names, with a comment linking the bug/reason it guards against."}}\n' "$FILE"
  fi

  exit 0
fi

exit 0
