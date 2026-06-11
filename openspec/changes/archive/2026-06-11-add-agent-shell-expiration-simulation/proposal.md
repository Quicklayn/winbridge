## Why

WinBridge authorization must fail closed when a session grant expires. The agent shell already simulates approval, visible activation, revocation, termination, and workflow audit events; it should also simulate TTL expiration so future Windows adapters can rely on the same lifecycle behavior.

## What Changes

- Expose `authorizationTtlMs` through the agent-shell CLI as `--authorization-ttl-ms`.
- After an explicitly approved visible active state, schedule expiration at the configured authorization TTL.
- Send `session-authorization-state` with status `expired` and a secret-safe `audit-event`.
- Suppress expiration if the authorization was already revoked or terminated.
- Add integration tests and documentation for development expiration simulation.
- Safety impact: this touches agent-shell consent workflow and audit protocol usage. It does not add screen capture, input injection, clipboard sync, file transfer, installer behavior, startup behavior, service registration, credential access, token disclosure, privilege elevation, persistence, or hidden access.

## Capabilities

### New Capabilities

### Modified Capabilities
- `agent-shell-consent-workflow`: Host shell can simulate authorization expiration after visible active approval and suppress expiration after terminal states.

## Impact

- `apps/agent-shell`: runtime expiration scheduling, CLI TTL parsing, and integration tests.
- `packages/protocol`: no schema changes expected; existing `session-authorization-state` and `audit-event` messages are reused.
- `docs`: README/security/architecture updates for development expiration simulation.
