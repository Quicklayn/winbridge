## 1. Protocol Validation

- [x] 1.1 Add a reusable non-secret `AuthorizationIdSchema` in `packages/protocol` and apply it to session authorization records.
- [x] 1.2 Apply `AuthorizationIdSchema` to authorization lifecycle, permission-revoked, session-control, and signal payload protocol validation.
- [x] 1.3 Update any non-native agent-shell authorization-id argument parsing to use the shared non-secret schema.
- [x] 1.4 Redact secret-bearing `authorizationId` values in audit detail metadata while preserving non-secret authorization ids.

## 2. Test Coverage

- [x] 2.1 Add protocol/state-machine tests that reject secret-bearing authorization ids and preserve safe non-secret ids.
- [x] 2.2 Add relay integration tests proving secret-bearing signal and lifecycle authorization ids are rejected before forwarding with secret-safe diagnostics and audit records.

## 3. Review And Verification

- [x] 3.1 Run focused tests for protocol and relay authorization-id rejection.
- [x] 3.2 Run a security review for auth, relay, token, and log-surface impact.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Archive the completed OpenSpec change after implementation and verification pass.
