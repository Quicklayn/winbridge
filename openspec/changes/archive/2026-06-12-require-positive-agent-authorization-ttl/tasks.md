## 1. Validation

- [x] 1.1 Split agent-shell authorization TTL parsing from lifecycle delay parsing so `--authorization-ttl-ms` requires `1..2147483647` and lifecycle delays keep `0..2147483647`.
- [x] 1.2 Split direct runtime validation so `authorizationTtlMs: 0` is rejected before relay startup while immediate lifecycle simulation delays remain valid.

## 2. Tests

- [x] 2.1 Add focused CLI argument coverage for positive authorization TTL, rejected zero authorization TTL, and still-valid zero lifecycle delays.
- [x] 2.2 Add focused direct runtime coverage for rejected zero authorization TTL.
- [x] 2.3 Replace zero-TTL expiration-boundary integration scenarios with positive short TTL scenarios.

## 3. Documentation

- [x] 3.1 Document the positive authorization TTL requirement in agent-shell security/architecture documentation.

## 4. Review And Verification

- [x] 4.1 Run a security review for the auth/consent validation diff.
- [x] 4.2 Run focused agent-shell tests.
- [x] 4.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.4 Archive the completed OpenSpec change after implementation and verification.
