## Why

The relay already audits invalid shared-token attempts without recording the raw presented token. Current regression coverage does not explicitly assert that the peer-facing WebSocket close reason is also bounded and does not echo either the presented invalid token or the configured shared token.

## What Changes

- Add focused relay integration coverage for invalid shared-token rejection.
- Verify the WebSocket close code/reason is bounded and secret-safe.
- Verify the denied token audit record keeps useful safe metadata while excluding raw token markers.
- Keep relay runtime behavior unchanged unless the test exposes a safety bug.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `relay-runtime`: Clarify invalid shared-token runtime verification covers both audit records and peer-facing close reasons.

## Impact

- Affected code: focused relay runtime integration tests and OpenSpec artifacts.
- Affected systems: development relay token rejection path.
- Safety impact: strengthens regression protection for token hygiene. This does not add capture, input, clipboard sync, file transfer, diagnostics export, installer, startup, service, or privilege behavior.
