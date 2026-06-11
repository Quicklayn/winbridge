## Why

The protocol has an authorization state machine, but peers do not yet have schema-validated messages for requesting, approving, activating, revoking, or terminating a session authorization. Future host/viewer UI and native adapters need those wire contracts before remote-control features are added.

## What Changes

- Add protocol messages for session authorization request, decision, state update, and permission revoke.
- Ensure messages carry scoped permissions, visible-session state, expiration, reason, and actor metadata where relevant.
- Add tests for valid lifecycle messages and malformed/unsafe messages.
- Keep these messages as contracts only; they do not grant screen/input access without the shared authorization state machine.

Safety impact:

- This change touches authorization protocol contracts.
- It does not add capture, input, clipboard, file transfer, installer, service, startup, privilege, or unattended access behavior.

## Capabilities

### New Capabilities
- `session-authorization-protocol`: Wire-level message contracts for consent-bound session authorization lifecycle.

### Modified Capabilities

None.

## Impact

- Updates `packages/protocol/src/messages.ts` and tests.
- Updates docs to describe lifecycle messages.
- Adds archived OpenSpec change artifacts and active `session-authorization-protocol` spec after archive.
