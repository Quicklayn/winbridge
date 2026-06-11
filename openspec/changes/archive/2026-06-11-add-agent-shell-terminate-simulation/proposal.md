## Why

WinBridge safety invariants require the host to be able to disconnect a remote assistance session immediately. The non-native agent shell already exercises approval, visible activation, permission revocation, and audit-event messages; it should also exercise host-initiated termination before native Windows UI or remote actions exist.

## What Changes

- Add host-side development options for scheduling session termination after an explicitly approved visible active session.
- Send existing `session-control` with `terminate`, then a `session-authorization-state` update with `terminated` status.
- Emit a secret-safe `audit-event` for termination simulation.
- Add integration tests proving termination is gated by visible active state and does not run when visibility is withheld.
- Document the development-only CLI options and safety boundary.
- Safety impact: this touches agent-shell consent workflow and audit protocol usage. It does not add screen capture, input injection, clipboard sync, file transfer, installer behavior, startup behavior, service registration, credential access, token disclosure, privilege elevation, persistence, or hidden access.

## Capabilities

### New Capabilities

### Modified Capabilities
- `agent-shell-consent-workflow`: Host shell can simulate explicit session termination only after visible active authorization.

## Impact

- `apps/agent-shell`: runtime options, CLI parsing, termination scheduling, and integration tests.
- `packages/protocol`: no schema changes expected; existing `session-control`, `session-authorization-state`, and `audit-event` messages are reused.
- `docs`: README/security/architecture updates for development termination simulation.
