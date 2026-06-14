## 1. Protocol Validation

- [x] 1.1 Add a shared base protocol `messageId` validation that rejects secret-bearing identifier metadata.
- [x] 1.2 Preserve safe UUID and non-secret development `messageId` acceptance.

## 2. Tests And Documentation

- [x] 2.1 Add protocol parser/encoder coverage for secret-bearing `messageId` rejection without raw id disclosure.
- [x] 2.2 Add relay integration coverage proving secret-bearing forwarded `messageId` is rejected before forwarding and accepted-forward audit.
- [x] 2.3 Update security documentation for secret-safe protocol message identifiers.

## 3. Review And Verification

- [x] 3.1 Run focused protocol and relay tests for secret-bearing `messageId` handling.
- [x] 3.2 Run strict OpenSpec validation for `reject-secret-bearing-protocol-message-ids`.
- [x] 3.3 Run security review for token/log/audit/relay rejection boundaries.
- [x] 3.4 Run full project verification: `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
