## 1. Protocol Pairing

- [x] 1.1 Add per-ticket pairing-code salt to the pairing ticket schema.
- [x] 1.2 Hash and verify pairing codes with the ticket salt.
- [x] 1.3 Keep raw pairing codes out of tickets and paired device records.

## 2. Tests

- [x] 2.1 Add protocol tests proving same pairing code creates distinct salts and hashes.
- [x] 2.2 Update pairing consumption tests for salted hash verification.
- [x] 2.3 Run relay pairing tests to verify shared protocol behavior remains compatible.

## 3. Documentation

- [x] 3.1 Document salted pairing ticket hashes and remaining development limitations.

## 4. Review And Verification

- [x] 4.1 Run security review for identity/pairing secret handling changes.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.3 Archive the completed OpenSpec change and verify no active changes remain.
