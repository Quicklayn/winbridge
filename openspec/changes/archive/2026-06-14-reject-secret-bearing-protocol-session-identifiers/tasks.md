## 1. Protocol Schema

- [x] 1.1 Add shared protocol envelope `sessionId` validation that rejects secret-bearing identifier metadata.
- [x] 1.2 Add protocol parse/encode tests proving secret-bearing `sessionId` rejection is bounded and safe ids remain accepted.

## 2. Relay Runtime And Docs

- [x] 2.1 Add relay integration coverage proving registered peer messages with secret-bearing `sessionId` values are rejected before forwarding or accepted-forward audit.
- [x] 2.2 Add relay integration coverage or adjust existing coverage proving join `sessionId` rejection remains before registration, pairing side effects, accepted join audit, and denied join audit.
- [x] 2.3 Update security documentation for protocol session id rejection and adjusted relay audit redaction boundaries.

## 3. Review And Verification

- [x] 3.1 Run focused protocol and relay tests for secret-bearing protocol session identifiers.
- [x] 3.2 Run strict OpenSpec validation for `reject-secret-bearing-protocol-session-identifiers`.
- [x] 3.3 Run security review for protocol parse/encode, relay forwarding, logs, and audit rejection boundaries.
- [x] 3.4 Sync and archive the OpenSpec change after implementation.
- [x] 3.5 Run full project verification: `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
