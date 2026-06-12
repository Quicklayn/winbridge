# Tasks

## 1. Authorization Validation

- [x] 1.1 Reject denied authorization records with `visibleToHost: true`.
- [x] 1.2 Reject denied `session-authorization-state` messages with `visibleToHost: true`.
- [x] 1.3 Preserve visible revoked, terminated, and expired terminal states with empty permissions.

## 2. Tests and Documentation

- [x] 2.1 Add focused authorization tests for denied visibility rejection and visible terminal history.
- [x] 2.2 Add focused protocol message tests for denied visibility rejection and visible terminal history.
- [x] 2.3 Update session authorization specs and security docs for denied visibility semantics.

## 3. Verification and Review

- [x] 3.1 Run focused authorization and protocol message tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete security review for denied visibility invariants.
- [x] 3.4 Archive the completed OpenSpec change.
