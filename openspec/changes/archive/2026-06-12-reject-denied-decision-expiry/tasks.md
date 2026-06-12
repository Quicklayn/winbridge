# Tasks

## 1. Protocol Validation

- [x] 1.1 Reject denied `session-authorization-decision` messages that include `expiresAt`.
- [x] 1.2 Preserve approved decision expiration and denied decision reason behavior.
- [x] 1.3 Add focused protocol tests for denied decisions with and without `expiresAt`.

## 2. Specs and Documentation

- [x] 2.1 Update `session-authorization-protocol` spec with the denied-expiration invariant.
- [x] 2.2 Update security documentation for approval-only expiration metadata.

## 3. Verification and Review

- [x] 3.1 Run focused protocol message tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete security review for authorization decision validation.
- [x] 3.4 Archive the completed OpenSpec change.
