## Why

Consent-bound session grants are the shared schema that future adapters can use immediately before authorizing sensitive remote actions. Their fixed identifiers currently validate only protocol syntax, so token-, credential-, cookie-, key-, or authorization-looking metadata can appear in `sessionId`, `hostPeerId`, `viewerPeerId`, or `auditId` before grant validation fails closed.

## What Changes

- Add grant-level validation for fixed consent-bound session grant identifiers.
- Reject secret-bearing marker families in `sessionId`, `hostPeerId`, `viewerPeerId`, and `auditId`.
- Ensure `assertConsentBoundGrant()` rejects unsafe grants without returning a snapshot.
- Ensure `assertRemoteActionAuthorized()` also fails closed because it parses the same grant schema before permission checks.
- Keep safe non-secret identifiers accepted and preserve existing immutability, permission, expiration, consent, and visible-session invariants.
- Keep rejection diagnostics bounded so raw rejected identifiers are not exposed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `session-authorization`: Extend consent-bound session grant invariants to reject secret-bearing fixed identifiers before validation returns a grant or authorizes an action.

## Impact

- Affected code: `packages/protocol/src/session.ts`, `packages/protocol/src/authorization.test.ts`, and `packages/protocol/src/identity.test.ts`.
- Affected behavior: grant validation and remote action authorization checks fail closed for secret-bearing grant identifiers.
- Security impact: reduces accidental secret metadata exposure at the authorization/grant boundary.
- Touches authorization/grant validation; does not touch capture, input, relay routing, installer behavior, startup behavior, services, token storage, logging sinks, native Windows APIs, or privilege elevation.
- Non-goals: no new remote action capability, no permission vocabulary change, no unattended access, no persistence, no hidden sessions, and no Windows prompt bypass.
