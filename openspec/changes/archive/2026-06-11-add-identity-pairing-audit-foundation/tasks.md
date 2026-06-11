## 1. OpenSpec

- [x] 1.1 Add proposal, design, identity-pairing spec, and audit-foundation spec.
- [x] 1.2 Validate the OpenSpec change in strict mode.

## 2. Protocol

- [x] 2.1 Add local device identity schema and helpers.
- [x] 2.2 Add pairing-ticket schema, hashing, expiration, and consumption helpers.
- [x] 2.3 Add structured audit record schema and helpers.
- [x] 2.4 Update join-session messages to carry optional device identity metadata.
- [x] 2.5 Add authorization helper proving pairing alone does not grant remote action permissions.

## 3. Audit Package

- [x] 3.1 Add `packages/audit-log` with audit sink interfaces.
- [x] 3.2 Add in-memory and console audit sinks.
- [x] 3.3 Add unit tests for validation and write order.
- [x] 3.4 Add redaction tests for tokens, raw pairing codes, credentials, keystrokes, and screen data.

## 4. Relay and Shell

- [x] 4.1 Emit relay audit records for token rejection, join success/failure, invalid messages, forwarding, and disconnect.
- [x] 4.2 Ensure relay audit details do not include raw tokens or raw pairing codes.
- [x] 4.3 Add local device identity metadata to agent-shell join messages.

## 5. Verification

- [x] 5.1 Run typecheck, tests, and build.
- [x] 5.2 Run strict OpenSpec validation.
- [x] 5.3 Archive the completed OpenSpec change.
- [x] 5.4 Commit and push the completed increment.
