## Context

`SessionGrantSchema` in `packages/protocol/src/session.ts` validates consent-bound grants before `assertConsentBoundGrant()` returns a snapshot. `assertRemoteActionAuthorized()` in `identity.ts` parses the same schema before checking permission membership and expiration.

Authorization records already reject secret-bearing `authorizationId` values, and other agent/relay/audit paths use secret-bearing protocol identifier detection for identifiers that could otherwise carry token-, credential-, cookie-, key-, or authorization-like metadata. Grant fixed identifiers should receive the same fail-closed treatment before any future adapter can use a malformed grant as an authorization boundary.

## Goals / Non-Goals

**Goals:**

- Reject secret-bearing marker families in consent-bound grant `sessionId`, `hostPeerId`, `viewerPeerId`, and `auditId`.
- Make both `assertConsentBoundGrant()` and `assertRemoteActionAuthorized()` fail closed for unsafe grant identifiers.
- Keep safe non-secret identifiers valid.
- Preserve permission validation, host-approval and visible-session literals, expiration checks, unknown-field rejection, and immutable grant snapshots.
- Keep validation diagnostics bounded and avoid raw rejected identifier leakage.

**Non-Goals:**

- No change to the global `ProtocolIdentifierSchema`.
- No change to authorization lifecycle transitions, permission vocabulary, relay pairing/routing, agent runtime behavior, capture, input, clipboard, file transfer, diagnostics, installer, startup, services, or native Windows APIs.
- No production account identity, token storage, unattended access, persistence, hidden session, or privilege elevation behavior.

## Decisions

1. Keep the validation scoped to `SessionGrantSchema`.
   - Rationale: consent-bound grants are the authorization boundary for remote actions, and the change should not alter unrelated protocol message identifiers without a separate compatibility review.
   - Alternative considered: refine `ProtocolIdentifierSchema` globally. Rejected because it would change every protocol identifier and exceed this change's scope.

2. Use a local session-module classifier for the marker families.
   - Rationale: `audit.ts` currently imports `session.ts`, so importing the audit helper back into `session.ts` would create a module cycle. A small local classifier keeps the grant boundary fail-closed without reshaping public exports.
   - Alternative considered: extract the helper to a new shared module. Rejected for this increment because it would touch several existing import paths and create a broader refactor.

3. Use a single bounded error message for all grant identifier fields.
   - Rationale: validation errors must identify the class of problem without echoing raw token-, credential-, cookie-, key-, or authorization-like values.
   - Alternative considered: field-specific messages containing the rejected identifier. Rejected because the rejected identifier is the sensitive data.

## Risks / Trade-offs

- [Risk] The local classifier could drift from the audit/protocol classifier.
  - Mitigation: tests cover the same marker families listed in the spec; a future cleanup can extract a shared helper behind its own OpenSpec change.
- [Risk] Existing development fixtures might use identifier words like `token` in grant IDs.
  - Mitigation: existing documented safe IDs such as `session-demo`, `host-1`, `viewer-1`, and `audit-demo` remain accepted.
- [Risk] This only covers consent-bound grant identifiers, not every protocol or authorization field.
  - Mitigation: the scope is intentionally narrow; other boundaries can be hardened through separate OpenSpec changes.
