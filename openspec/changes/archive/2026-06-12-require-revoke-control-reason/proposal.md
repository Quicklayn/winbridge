## Why

`session-control` revoke-permission messages identify the authorization and permission being revoked, but the schema currently allows the revocation reason to be omitted. Permission revocation is a sensitive authorization lifecycle event, so the protocol should require an explicit non-blank reason for auditability and operator clarity.

## What Changes

- Require `session-control` messages with action `revoke-permission` to include a non-blank `reason`.
- Keep `pause`, `resume`, and `terminate` session-control reasons optional, while preserving the existing non-blank validation when a reason is present.
- Add focused protocol tests for missing revoke reasons and non-revoke controls that omit optional reasons.
- Sync the accepted requirement into the main session authorization protocol spec.
- **BREAKING**: protocol peers that send `revoke-permission` controls without `reason` will be rejected as malformed.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization-protocol`: tighten `session-control` revoke-permission payload invariants so revocation intent is explicit and auditable.

## Impact

- Affected code: `packages/protocol/src/messages.ts`, `packages/protocol/src/messages.test.ts`.
- Affected API/contract: `session-control` protocol envelopes with `action: "revoke-permission"`.
- Safety impact: strengthens revocation auditability and fail-closed authorization semantics.
- Touches auth/protocol behavior; requires focused security review.
- Does not touch screen capture, input execution, clipboard, file transfer, diagnostics collection, relay routing, installer behavior, startup behavior, services, tokens, logs, privilege elevation, persistence, or native Windows APIs.
