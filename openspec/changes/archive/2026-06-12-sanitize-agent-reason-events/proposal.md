## Why

The agent shell validates and bounds decision and lifecycle reason strings, and workflow audit details avoid raw private reasons. However, local `sent` and `received` runtime events can still expose protocol `reason` fields from denial, revocation, pause, resume, termination, expiration, and related control messages. Event consumers can accidentally persist or display host-private operational text that is not required for consent workflow observability.

## What Changes

- Redact `reason` fields from local `sent` and `received` runtime event views while preserving safe metadata that a reason was present.
- Keep protocol validation, relay forwarding, socket send behavior, and internal workflow handling unchanged.
- Add focused runtime tests for outbound and inbound reason redaction.
- Update specs and docs to describe reason-safe local event views.
- Non-goals: no screen capture, remote input, clipboard sync, file transfer, installer, startup persistence, services, privilege elevation, reconnect behavior, stealth behavior, or Windows prompt changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: add a requirement that local runtime event views do not expose raw protocol reason text.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts` and runtime integration tests.
- Affected API: local `AgentShellEvent` protocol message views expose redacted reason values instead of raw reason text for messages that carry `reason`.
- Affected documentation: agent shell architecture/security notes.
- Safety impact: touches event diagnostics only; no remote assistance capability is added or expanded.
- Review gate: security review required because the change touches log/event handling and private lifecycle reason handling.
