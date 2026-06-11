## Why

WinBridge requires the host to be able to revoke permissions immediately. The current non-native agent shell can simulate request, decision, and active visible state, but it does not exercise the revocation path that future Windows UI and adapters must respect.

## What Changes

- Add host-side development options for sending a permission revocation after an explicitly approved and visible active session state.
- Send `permission-revoked` followed by a `session-authorization-state` update that removes the permission or marks the authorization revoked when no permissions remain.
- Add integration tests proving revoke messages pass through the relay and visible approval remains required before revoke simulation starts.
- Document the development-only CLI options and safety boundary.
- Safety impact: this touches agent-shell consent workflow, authorization protocol usage, and user-visible workflow simulation. It does not add screen capture, input injection, clipboard sync, file transfer, installer behavior, startup behavior, service registration, credential access, token disclosure, or privilege elevation.
- Non-goals: production host UI, native Windows controls, hidden sessions, unattended access, stealth persistence, credential collection, keylogging, AV/EDR evasion, Windows prompt bypass, and any host-invisible access remain prohibited.

## Capabilities

### New Capabilities

### Modified Capabilities
- `agent-shell-consent-workflow`: Host shell can simulate explicit permission revocation only after an explicitly approved visible session.

## Impact

- `apps/agent-shell`: runtime options, CLI parsing, revoke scheduling, and integration tests.
- `packages/protocol`: no schema changes expected; existing `permission-revoked` and `session-authorization-state` messages are reused.
- `docs`: README/security/architecture updates for development revoke simulation.
