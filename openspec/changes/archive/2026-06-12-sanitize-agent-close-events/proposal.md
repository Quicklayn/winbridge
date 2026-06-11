## Why

The agent shell currently logs WebSocket close reasons as byte counts, but its local `closed` runtime event exposes the raw close reason string. A relay, proxy, or future test harness could include tokens, pairing material, parser details, or other sensitive fragments in that reason, and local event consumers might persist or display it.

## What Changes

- Emit `closed` runtime events with a redacted reason placeholder instead of the raw WebSocket close reason.
- Preserve safe diagnostics by including the close code and reason byte length.
- Add focused test coverage for a server-provided private close reason.
- Update docs and specs to cover secret-safe close events.
- Non-goals: no screen capture, remote input, clipboard sync, file transfer, installer, startup persistence, services, privilege elevation, reconnect behavior, stealth behavior, or Windows prompt changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: add a requirement that local `closed` runtime events do not expose raw WebSocket close reasons.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and runtime integration tests.
- Affected API: the local `AgentShellEvent` `closed` event keeps `code` and a redacted `reason`, and adds `reasonBytes`.
- Affected documentation: agent shell architecture/security notes.
- Safety impact: touches log/event diagnostics only; does not add or alter any remote assistance capability.
- Review gate: security review required because the change touches log/event handling.
