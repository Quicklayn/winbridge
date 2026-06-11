## Why

`session-control` messages represent host pause, resume, termination, and permission-revocation intent, but the current schema allows ambiguous shapes such as `revoke-permission` without a permission or pause/resume messages that carry an unrelated permission. Tightening the wire contract prevents malformed control messages from being forwarded or processed by peers.

## What Changes

- Require `session-control` action `revoke-permission` to include the revoked permission.
- Reject `pause`, `resume`, and `terminate` control messages that include a permission field.
- Reject blank `session-control` reasons when a reason is provided.
- Add protocol tests for valid control actions and malformed control payloads.
- Non-goals: no new remote actions, capture, input, clipboard, file transfer, installer, startup, service, token, privilege elevation, or native Windows behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization-protocol`: add fail-closed schema invariants for `session-control` action payloads.

## Impact

- Affected code: `packages/protocol/src/messages.ts`, `packages/protocol/src/messages.test.ts`.
- Affected specs: `openspec/specs/session-authorization-protocol/spec.md` through this delta.
- Safety impact: prevents malformed host control messages from representing ambiguous pause, resume, terminate, or permission-revocation intent.
