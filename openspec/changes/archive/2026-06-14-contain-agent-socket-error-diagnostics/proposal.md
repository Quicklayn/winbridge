## Why

Agent shell WebSocket error diagnostics should remain best-effort observability. The runtime already formats socket errors without raw exception text, but the socket `error` callback calls the configured logger directly, so a failing diagnostic logger can escape the callback instead of being contained.

## What Changes

- Treat WebSocket socket-error diagnostic logging as best-effort.
- Contain diagnostic logger failures while preserving existing secret-safe socket error formatting.
- Add integration coverage proving a logger failure during socket-error reporting does not expose raw socket or logger error text and does not grant permissions, activate visibility, send protocol messages, or bypass consent.
- No breaking changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: runtime socket error diagnostics must contain diagnostic logger failures and remain secret-safe/non-authorizing.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected systems: non-native agent shell diagnostics/logs around WebSocket socket failures.
- Safety impact: strengthens diagnostic failure containment. This does not grant permissions, activate host visibility, start capture, send input, reconnect peers, or bypass consent.
- Touches: logs and agent-shell runtime diagnostics.
- Does not touch: relay protocol behavior, capture, input, auth semantics, installer, startup, services, tokens, native Windows APIs, privilege elevation, persistence, or host consent UI.
- Non-goals: no covert access, hidden sessions, stealth persistence, credential collection, keylogging, AV/EDR evasion, or Windows prompt bypass.
