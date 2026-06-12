## 1. Protocol and Relay Behavior

- [x] 1.1 Add `heartbeat-timeout` to the shared peer-disconnect reason code schema.
- [x] 1.2 Track relay heartbeat timeout before socket termination and emit `heartbeat-timeout` through normal disconnect cleanup.

## 2. Tests

- [x] 2.1 Add relay integration coverage for heartbeat timeout `peer-disconnected.reasonCode`.
- [x] 2.2 Verify heartbeat timeout disconnect audit remains bounded and secret-safe.

## 3. Verification

- [x] 3.1 Run focused protocol and relay tests.
- [x] 3.2 Run strict OpenSpec validation for the change.
- [x] 3.3 Complete security review for relay/protocol/audit impact.
- [x] 3.4 Run the repository verification suite.
