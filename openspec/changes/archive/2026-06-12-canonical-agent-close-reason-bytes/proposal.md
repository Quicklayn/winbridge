## Why

Agent-shell close events already redact WebSocket close reason text, but the `reasonBytes` metadata is calculated from `reason.length`. That can diverge from the actual UTF-8 byte length for multi-byte close reasons, weakening diagnostics consistency while still avoiding raw text exposure.

## What Changes

- Calculate agent-shell WebSocket close `reasonBytes` from the actual close reason UTF-8 byte length.
- Add regression coverage for multi-byte private close reasons proving the reason remains redacted and the byte count is accurate.
- Keep the existing local `closed` event shape and disconnect log shape unchanged.
- Non-goals: no reconnect behavior, no transport change, no relay protocol change, no screen capture, no input injection, no clipboard, no file transfer, no diagnostics collection, no native Windows API, no installer, no startup persistence, no service behavior, no token format, no privilege elevation, and no hidden session behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: redacted WebSocket close events and logs must expose accurate close reason UTF-8 byte-length metadata without exposing raw close reason text.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and focused runtime integration tests.
- Affected APIs: no event shape change; `closed.reasonBytes` remains a number.
- Affected systems: local agent-shell runtime events and disconnect logs.
- Safety impact: strengthens secret-safe local diagnostics without adding remote access capability. Touches local logs/events for a consent workflow and requires security review.
