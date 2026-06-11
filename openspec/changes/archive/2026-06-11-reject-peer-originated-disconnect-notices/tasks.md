## 1. Relay Runtime

- [x] 1.1 Reject peer-originated `peer-disconnected` messages before forwarding.
- [x] 1.2 Add relay integration tests proving forged disconnect notices are rejected and not delivered.
- [x] 1.3 Verify rejection audit metadata is secret-safe.

## 2. Documentation

- [x] 2.1 Document relay-originated disconnect notice authority and forged-message rejection.

## 3. Review And Verification

- [x] 3.1 Run security review for relay lifecycle rejection behavior.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Archive the completed OpenSpec change and verify no active changes remain.
