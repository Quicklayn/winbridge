## Why

Session authorization protocol state messages already require a validated reason for terminal statuses, but the shared `SessionAuthorizationSchema` still accepts terminal authorization records without `reason`. Terminal records are audit-facing lifecycle evidence and should not be trusted when the reason for denial, revocation, termination, or expiration is missing.

## What Changes

- Require parsed `denied`, `revoked`, `terminated`, and `expired` authorization records to include a validated non-blank `reason`.
- Preserve existing state-machine transitions, which already record reasons for terminal outcomes through required inputs or safe defaults.
- Add focused protocol authorization tests for terminal records missing reasons and accepted terminal records with reasons.
- No capture, input, relay routing, installer, startup, service, token, log persistence, or privilege behavior changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization`: Schema-level authorization record invariants will reject terminal records that lack auditable lifecycle reasons.

## Impact

- Affected code: `packages/protocol/src/authorization.ts` and `packages/protocol/src/authorization.test.ts`.
- Affected systems: protocol authorization parsing used before local action authorization and future audit/adapters that consume authorization records.
- Safety impact: terminal authorization state cannot be treated as trusted lifecycle evidence without a bounded, secret-safe reason.
- Touch areas: auth/protocol validation. Security review is required before completion.
