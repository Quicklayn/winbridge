## Why

The agent shell currently accepts any `--relay` value and leaves malformed or non-WebSocket URLs to fail later when the runtime constructs the WebSocket client. Relay endpoint configuration should fail before runtime startup, consistent with other CLI validation.

## What Changes

- Validate `--relay` as an absolute `ws://` or `wss://` URL during argument parsing.
- Keep the existing default `ws://localhost:8787`.
- Return existing bounded usage handling for malformed, relative, or non-WebSocket relay URLs.
- Non-goals: no relay protocol changes, no production endpoint trust policy, no token or account authentication changes.

## Capabilities

### New Capabilities

### Modified Capabilities
- `agent-shell-consent-workflow`: CLI argument validation rejects malformed relay URL values before runtime startup.

## Impact

- Affected code: `apps/agent-shell/src/args.ts`, `apps/agent-shell/src/args.test.ts`, docs, and OpenSpec artifacts.
- Safety impact: networking-adjacent CLI hardening; does not add remote capabilities or relax consent, visibility, revoke, auth, or audit behavior.
