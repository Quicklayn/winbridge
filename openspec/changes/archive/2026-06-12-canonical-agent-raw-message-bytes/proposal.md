## Why

Agent-shell raw inbound message events and logs are redacted, but their `byteLength` metadata is calculated after converting WebSocket `RawData` to text. For binary or invalid UTF-8 frames, string conversion can change byte counts and make summary diagnostics inaccurate.

## What Changes

- Measure inbound WebSocket raw payload bytes before UTF-8 text conversion in the agent shell.
- Use that raw byte count for non-protocol `raw` events/logs and ignored unsafe inbound protocol summaries.
- Add regression coverage for binary non-protocol input proving the raw payload remains redacted and byte metadata reflects actual WebSocket bytes.
- Keep runtime event shapes, protocol validation, consent gates, authorization binding, and redaction behavior unchanged.
- Non-goals: no screen capture, input injection, clipboard, file transfer, diagnostics collection, native Windows API, installer, startup persistence, service behavior, token format, privilege elevation, reconnect behavior, relay protocol change, or hidden session behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: raw inbound message event/log byte-length metadata must reflect actual WebSocket payload bytes without exposing raw payload content.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and focused runtime integration tests.
- Affected APIs: no shape change; `raw.byteLength` remains a number.
- Affected systems: local agent-shell runtime events and logs for non-protocol or ignored unsafe inbound messages.
- Safety impact: strengthens secret-safe diagnostics without adding remote access capability. Touches local logs/events and requires security review.
