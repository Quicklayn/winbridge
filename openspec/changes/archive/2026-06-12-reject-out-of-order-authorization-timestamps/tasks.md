## 1. Authorization Timestamp Validation

- [x] 1.1 Reject records whose `updatedAt` is earlier than `createdAt`.
- [x] 1.2 Reject records whose `expiresAt` is not after `createdAt`.
- [x] 1.3 Reject lifecycle timestamps outside the `createdAt` to `updatedAt` record window.

## 2. Tests and Documentation

- [x] 2.1 Add focused schema tests for out-of-order authorization timestamps.
- [x] 2.2 Document authorization timestamp ordering as audit-integrity validation.

## 3. Review and Verification

- [x] 3.1 Perform security review for authorization timestamp ordering, confirming no capture, input, hidden session, persistence, credential access, keylogging, token/payload logging, or Windows prompt bypass was introduced.
- [x] 3.2 Run focused authorization tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Archive the completed OpenSpec change after implementation and verification.
