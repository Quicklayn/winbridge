## 1. Integration Coverage

- [x] 1.1 Add a WebSocket integration test that forwards a schema-valid `hello` message between paired peers.
- [x] 1.2 Verify the accepted forward audit detail includes only message and recipient routing metadata.
- [x] 1.3 Verify the accepted forward audit record omits raw `hello` display name and capability values.

## 2. Specs and Verification

- [x] 2.1 Sync main `relay-runtime` spec with forwarded `hello` audit coverage.
- [x] 2.2 Run focused relay integration tests.
- [x] 2.3 Run strict OpenSpec validation for `verify-forwarded-hello-audit`.
- [x] 2.4 Run `npm run verify`.
- [x] 2.5 Perform a security review of forwarded `hello` audit assertions, leakage checks, and OpenSpec impact.
