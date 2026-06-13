## Why

`session-control` termination ends an active or paused authorization, but the protocol currently allows `terminate` without a reason. Termination should be auditable like permission revocation because it immediately ends host-approved access.

## What Changes

- Require `session-control` messages with action `terminate` to include a valid reason.
- Preserve existing optional reasons for `pause` and `resume`.
- Keep `revoke-permission` requiring both permission and reason.
- Add focused protocol tests for accepted termination reasons and rejected missing reasons.
- No capture, input, relay routing, installer, startup, service, token, or privilege behavior changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization-protocol`: Session-control termination payload validation will require a reason.

## Impact

- Affected code: `packages/protocol/src/messages.ts` and protocol message tests.
- Affected systems: protocol validation used by relay and agent-shell before forwarding or processing session-control messages.
- Safety impact: prevents unauditable termination controls while keeping host revocation and disconnect workflows explicit.
- Touch areas: auth/protocol validation. Security review is required before completion.
