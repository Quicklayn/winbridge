## 1. Integration Coverage

- [x] 1.1 Add a relay WebSocket integration test that forwards a schema-valid host-originated `audit-event` message between paired peers.
- [x] 1.2 Verify the viewer receives the forwarded `audit-event` with sensitive detail fields redacted.
- [x] 1.3 Verify the accepted forward audit detail includes only message and recipient routing metadata.
- [x] 1.4 Verify the accepted relay forwarding audit record omits raw audit-event detail values and private markers.

## 2. Specs and Verification

- [x] 2.1 Sync main `relay-runtime` spec with forwarded `audit-event` audit safety coverage.
- [x] 2.2 Run focused relay integration tests for the forwarded `audit-event` path.
- [x] 2.3 Run strict OpenSpec validation for `verify-relay-forwarded-audit-event-safety`.
- [x] 2.4 Run `npm run verify`.
- [x] 2.5 Perform a security review of forwarded `audit-event` assertions, relay audit leakage checks, and OpenSpec impact.
