## Why

The agent shell now redacts inbound `signal` payloads from local `received` runtime events, but outbound `signal` messages still expose their raw payloads through local `sent` events. Event consumers can accidentally persist SDP, ICE candidates, diagnostics, or future transport metadata even though those values are not needed for consent workflow observation.

## What Changes

- Emit local `sent` runtime events for `signal` messages with a redacted payload summary instead of the original payload object.
- Preserve safe diagnostics by including signal payload byte length.
- Keep protocol validation, relay forwarding, and runtime send behavior unchanged; only the local event view is redacted.
- Add focused runtime integration coverage for outbound signal event redaction.
- Non-goals: no screen capture, remote input, clipboard sync, file transfer, installer, startup persistence, services, privilege elevation, reconnect behavior, stealth behavior, or Windows prompt changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: add a requirement that local `sent` runtime events for `signal` messages do not expose raw signal payload contents.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and runtime integration tests.
- Affected API: local `AgentShellEvent` `sent` events for `signal` messages still identify the signal message but expose a redacted payload summary.
- Affected documentation: agent shell architecture/security notes.
- Safety impact: touches event diagnostics only; no remote assistance capability is added or expanded.
- Review gate: security review required because the change touches log/event handling.
