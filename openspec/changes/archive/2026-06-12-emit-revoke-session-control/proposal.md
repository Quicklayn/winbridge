## Why

Permission revocation is a host-visible live-session control, but the non-native host workflow currently emits `permission-revoked` and state update messages without the explicit `session-control` revoke intent already present in the protocol. Emitting the bound control makes revocation ordering clearer for future Windows adapters and lets peers fail closed as soon as the control is observed.

## What Changes

- Host revoke simulation sends `session-control` with action `revoke-permission`, the affected `authorizationId`, the host actor, revoked permission, and secret-safe reason before `permission-revoked` and the follow-up authorization state.
- Viewer-side runtime continues to apply bound `session-control` revoke-permission messages only when the authorization id and host authority match the current authorization.
- Tests verify that the revoke control is emitted, bound to the same authorization, does not leak private reason text, and causes viewer signal sends for the revoked permission to fail before later state processing is required.
- Safety non-goals: no screen capture, input injection, clipboard sync, file transfer, installer, startup persistence, service behavior, privilege elevation, hidden sessions, or Windows prompt bypass.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: host permission revocation simulation must emit a bound revoke-permission `session-control` before revocation state messages.
- `session-authorization-protocol`: permission revocation lifecycle guidance clarifies that revoke controls are authorization-bound and do not grant access.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: `openspec/specs/agent-shell-consent-workflow/spec.md`, `openspec/specs/session-authorization-protocol/spec.md`, security/architecture documentation.
- Touches auth workflow messages and local redacted event surfaces. Does not touch relay routing, native capture, input injection, installer, startup, services, shared tokens, durable logs, or privilege elevation.
