## 1. Relay Join Boundary

- [x] 1.1 Reject duplicate live peer-id joins in the room registry before role checks, pairing-ticket creation, viewer ticket consumption, or peer replacement.
- [x] 1.2 Return a bounded relay error/audit reason for duplicate live peer-id join attempts without exposing raw identifiers or pairing material.

## 2. Tests and Documentation

- [x] 2.1 Add room-registry tests proving duplicate host/viewer joins are rejected and original peers/pairing state remain intact.
- [x] 2.2 Add relay integration tests for duplicate live host and viewer joins, including secret-safe audit diagnostics and original peer continuity.
- [x] 2.3 Update architecture/security documentation to describe live peer-id exclusivity and normal rejoin after disconnect cleanup.

## 3. Verification

- [x] 3.1 Run focused room/relay duplicate-join tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete security review for relay join, pairing, and audit changes.
