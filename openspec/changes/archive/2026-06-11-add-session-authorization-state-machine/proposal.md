## Why

The project now has identity, pairing, and audit foundations, but it still lacks an explicit lifecycle model that future capture/input code must obey. A deny-by-default session authorization state machine is needed before adding any remote-control primitives.

## What Changes

- Add a `session-authorization` capability for consent-bound session lifecycle states and permission checks.
- Add protocol helpers that create pending session requests, approve or deny them, activate only visible host sessions, revoke permissions, terminate sessions, and authorize remote actions.
- Add tests proving pairing alone does not authorize remote actions, inactive sessions deny actions, invisible sessions cannot become active, revocation blocks actions, and expired grants fail closed.
- Keep implementation limited to protocol/state contracts; no screen capture, input, clipboard, file transfer, installer, startup, services, or privilege behavior is added.

Safety impact:

- This change touches authorization logic and audit-related state transitions.
- It strengthens the required host consent and visible-session gate before any future remote action.

## Capabilities

### New Capabilities
- `session-authorization`: Consent-bound session lifecycle, permission grants, revocation, and deny-by-default remote action authorization.

### Modified Capabilities

None.

## Impact

- Adds protocol state-machine code and tests under `packages/protocol`.
- Updates docs to describe authorization lifecycle.
- Adds archived OpenSpec change artifacts and active `session-authorization` spec after archive.
