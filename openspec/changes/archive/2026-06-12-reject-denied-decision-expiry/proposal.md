## Why

Session authorization decisions already require `expiresAt` for approvals, but
denied decisions can still carry an expiration timestamp. That timestamp is not
a grant by itself, but it creates ambiguous lifecycle metadata for a fail-closed
decision and can confuse future adapters.

## What Changes

- Reject `session-authorization-decision` messages where `decision` is `denied`
  and `expiresAt` is present.
- Keep approval behavior unchanged: approved decisions still require
  non-empty grants and `expiresAt`.
- Add protocol tests for denied decisions with and without `expiresAt`.
- Update the session authorization protocol spec and security docs.
- Non-goal: no capture, input, clipboard, file transfer, service, installer,
  startup, persistence, or privilege behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `session-authorization-protocol`: denied authorization decisions must not carry
  approval-only expiration metadata.

## Impact

- Affected code: `packages/protocol/src/messages.ts`,
  `packages/protocol/src/messages.test.ts`.
- Affected docs/specs: `openspec/specs/session-authorization-protocol/spec.md`,
  `docs/security-model.md`.
- Touches protocol/auth validation only. It strengthens fail-closed behavior and
  does not grant any new remote capability.
