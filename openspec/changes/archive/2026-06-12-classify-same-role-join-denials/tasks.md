## 1. Relay Classification

- [x] 1.1 Add a bounded same-role join denial reason constant in the relay room registry.
- [x] 1.2 Allow the same-role denial reason through relay safe-reason mapping.
- [x] 1.3 Add secret-safe audit detail classification for same-role join conflicts.

## 2. Tests

- [x] 2.1 Update second-host and second-viewer integration tests to assert the bounded same-role relay error.
- [x] 2.2 Verify same-role denial audit detail includes role-conflict metadata and omits pairing credentials or protocol payloads.
- [x] 2.3 Run focused relay integration tests.

## 3. Verification and Review

- [x] 3.1 Run strict OpenSpec validation for `classify-same-role-join-denials`.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Run `npm run verify`.
- [x] 3.7 Perform security review for relay join-denial reason and audit metadata changes.
