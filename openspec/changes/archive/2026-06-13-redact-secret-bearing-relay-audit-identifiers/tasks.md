## 1. Relay Audit Identifier Projection

- [x] 1.1 Redact secret-bearing relay peer ids before they become readable audit actor ids.
- [x] 1.2 Redact secret-bearing relay session ids before they become top-level audit `sessionId`.
- [x] 1.3 Redact secret-bearing join `deviceIdentity.deviceId` values in accepted and denied join audit detail.
- [x] 1.4 Redact secret-bearing recipient peer ids in accepted forward audit detail.

## 2. Tests

- [x] 2.1 Add relay audit tests for accepted joins with secret-bearing session and peer identifiers.
- [x] 2.2 Add relay audit tests for accepted and denied join device ids with secret-bearing identifiers.
- [x] 2.3 Add relay audit tests for forwarded recipient peer ids with secret-bearing identifiers.

## 3. Review And Verification

- [x] 3.1 Run targeted relay tests for secret-bearing audit identifier redaction.
- [x] 3.2 Run security review for relay/token/log changes.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Archive the completed OpenSpec change after implementation and verification.
