## Why

Parsed post-activation terminal authorization records can currently carry prior approval and activation timestamps while reporting `visibleToHost: false`. That combination erases visible-session evidence from final revocation, termination, or post-activation expiration records and weakens auditability for consent-first remote assistance.

## What Changes

- Require parsed `revoked` and `terminated` authorization records to keep `visibleToHost: true`.
- Require parsed `expired` authorization records that carry post-activation history to keep `visibleToHost: true`.
- Preserve accepted parsing for pre-access `denied` and non-visible `expired` records that never activated.
- Add focused protocol authorization tests for invisible post-activation terminal records and preserved pre-access terminal records.
- No capture, input, relay routing, installer, startup, service, token, log persistence, or privilege behavior changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization`: Schema-level authorization record invariants will reject post-activation terminal records that discard visible-session history.

## Impact

- Affected code: `packages/protocol/src/authorization.ts` and `packages/protocol/src/authorization.test.ts`.
- Affected systems: protocol authorization parsing used before local action authorization and by future adapters that consume authorization records.
- Safety impact: final lifecycle records for sessions that reached visible activation cannot be represented as hidden or invisible history.
- Touch areas: auth/protocol validation. Security review is required before completion.
