## Why

`session-control` currently carries host actor and action metadata but does not identify the authorization grant it controls. Future Windows adapters need pause, resume, terminate, and permission-revoke controls to be bound to the same explicit host-approved authorization so stale or cross-grant controls cannot alter remote-action state.

## What Changes

- **BREAKING**: require every `session-control` protocol message to include `authorizationId`.
- Bind agent-shell viewer-side `session-control` handling to the currently approved authorization id and host authority before it can pause, resume, terminate, or revoke signal-send authorization.
- Include `authorizationId` on host-generated pause, resume, and terminate controls in the non-native shell.
- Keep ignored or rejected control diagnostics secret-safe and metadata-only.
- Add protocol and agent-shell coverage for missing, mismatched, and valid authorization-bound controls.
- Safety non-goals: no screen capture, input injection, clipboard sync, file transfer, installer, startup persistence, service behavior, privilege elevation, hidden sessions, or Windows security prompt bypass.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization-protocol`: `session-control` messages must identify the authorization grant they affect.
- `agent-shell-consent-workflow`: viewer-side control handling must require both bound host authority and matching authorization id before changing local authorization state.

## Impact

- Affected code: `packages/protocol/src/messages.ts`, `apps/agent-shell/src/runtime.ts`.
- Affected tests: `packages/protocol/src/messages.test.ts`, `apps/agent-shell/src/runtime.integration.test.ts`, relay integration fixtures that construct `session-control`.
- Affected docs/specs: `openspec/specs/session-authorization-protocol/spec.md`, `openspec/specs/agent-shell-consent-workflow/spec.md`, security/architecture documentation.
- Touches auth protocol semantics and secret-safe diagnostics. Does not touch native capture, input injection, relay auth tokens, installer, startup, services, logs persistence format, or privilege elevation.
