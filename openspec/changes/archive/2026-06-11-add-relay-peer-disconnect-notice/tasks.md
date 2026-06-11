## 1. Protocol

- [x] 1.1 Add a schema-valid `peer-disconnected` protocol envelope with bounded reason codes.
- [x] 1.2 Add protocol tests for accepted disconnect notices and rejected unsafe reason values.

## 2. Relay Runtime

- [x] 2.1 Send `peer-disconnected` notices to remaining peers when a registered peer disconnects.
- [x] 2.2 Extend relay disconnect audit records with secret-safe notification metadata.
- [x] 2.3 Add relay integration tests for host disconnect, viewer disconnect, and no-recipient audit behavior.

## 3. Documentation

- [x] 3.1 Document relay peer disconnect notification behavior and safety boundaries.

## 4. Review And Verification

- [x] 4.1 Run security review for protocol, relay, and audit changes.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.3 Archive the completed OpenSpec change and verify no active changes remain.
