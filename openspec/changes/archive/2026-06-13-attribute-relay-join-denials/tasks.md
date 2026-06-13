## 1. Specification Readiness

- [x] 1.1 Validate the OpenSpec change strictly before implementation.

## 2. Runtime Implementation

- [x] 2.1 Add attempted `sessionId` and `peerId` attribution to decoded `join-session` denial audit records.
- [x] 2.2 Preserve existing secret-safe denial detail and pairing-code redaction.

## 3. Tests

- [x] 3.1 Extend missing-ticket viewer denial coverage to assert attempted session and peer actor attribution.
- [x] 3.2 Extend duplicate-peer denial coverage to assert attempted session and peer actor attribution.
- [x] 3.3 Verify denied join audit records still omit raw pairing codes.
- [x] 3.4 Add coverage for pairing-code-bearing attempted session and peer identifiers.

## 4. Verification and Review

- [x] 4.1 Run focused relay integration tests for join-denial attribution.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
- [x] 4.6 Complete a security review for relay audit/log behavior.
