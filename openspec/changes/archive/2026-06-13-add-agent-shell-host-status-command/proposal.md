## Why

The development host control prompt can pause, resume, revoke, terminate, and disconnect, but it cannot show the host operator the current local visible-session state before choosing a control. Adding a read-only status command exercises the future host status surface while keeping remote actions gated by the existing authorization state machine.

## What Changes

- Add a host-control prompt `status` command that reports secret-safe local host session status.
- Expose a managed runtime status snapshot for the local host authorization/indicator state.
- Ensure status output is read-only and does not send protocol messages, grant permissions, start signaling, or alter lifecycle state.
- Document and test that status output is bounded to non-secret authorization metadata such as indicator state, authorization status, visible flag, permission count, and authorization id when available.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: host control prompt gains a read-only status command for the local host status surface.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/host-control-prompt.ts`, agent-shell tests.
- Affected docs: `README.md`, `docs/architecture.md`, `docs/security-model.md`.
- Security touchpoints: user-visible local status output and authorization metadata. This change does not touch capture, input execution, relay routing, installer behavior, startup persistence, services, tokens, privilege elevation, WebRTC, or native Windows APIs.
