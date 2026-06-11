## 1. Relay Pairing State

- [x] 1.1 Replace raw pairing-code peer state with host-created hashed pairing tickets in `RoomRegistry`.
- [x] 1.2 Require host-created ticket before viewer registration and consume one use for accepted viewer joins.
- [x] 1.3 Reject missing, mismatched, expired, and consumed pairing tickets before viewer registration.

## 2. Runtime Configuration and Audit

- [x] 2.1 Add development pairing ticket TTL and maximum-use configuration to relay runtime and CLI environment handling.
- [x] 2.2 Emit secret-safe audit details for pairing ticket creation, consumption, and denied pairing joins.
- [x] 2.3 Ensure relay audit/log output does not include raw pairing codes, tokens, credentials, protocol payloads, keystrokes, screenshots, or screen contents.

## 3. Tests and Documentation

- [x] 3.1 Add focused room registry tests for ticket creation, consumption, expiry, and consumed-ticket rejection.
- [x] 3.2 Add relay integration tests for accepted pairing, viewer-first rejection, mismatched rejection, expired rejection, consumed rejection, and audit redaction.
- [x] 3.3 Document development pairing ticket TTL/use behavior and safety boundaries in README and security/architecture docs.

## 4. Review and Verification

- [x] 4.1 Run security review for relay auth, secrets, and audit changes.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
- [x] 4.6 Archive the completed OpenSpec change and rerun validation.
