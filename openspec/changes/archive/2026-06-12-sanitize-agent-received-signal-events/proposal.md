## Why

The agent shell already keeps received message logs and workflow audit sinks free of raw protocol payloads, but local `received` runtime events still expose the full `signal.payload`. Signaling payloads can contain SDP, ICE candidates, diagnostics, or future transport metadata that should not be accidentally persisted or displayed by event consumers.

## What Changes

- Emit local `received` runtime events for `signal` messages with a redacted payload summary instead of the original payload object.
- Preserve safe diagnostics by including signal payload byte length.
- Keep protocol decode, relay forwarding, and runtime workflow behavior unchanged; only the local event view is redacted.
- Add focused runtime integration coverage for received signal event redaction.
- Non-goals: no screen capture, remote input, clipboard sync, file transfer, installer, startup persistence, services, privilege elevation, reconnect behavior, stealth behavior, or Windows prompt changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: add a requirement that local `received` runtime events for `signal` messages do not expose raw signal payload contents.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and runtime integration tests.
- Affected API: local `AgentShellEvent` `received` events for `signal` messages still identify the signal message but expose a redacted payload summary.
- Affected documentation: agent shell architecture/security notes.
- Safety impact: touches event diagnostics only; no remote assistance capability is added or expanded.
- Review gate: security review required because the change touches log/event handling.
