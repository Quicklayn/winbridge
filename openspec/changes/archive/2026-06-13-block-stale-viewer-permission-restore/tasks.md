## 1. Specification Readiness

- [x] 1.1 Validate the OpenSpec change strictly before implementation.

## 2. Runtime Implementation

- [x] 2.1 Add viewer-side revoked permission memory scoped to the current authorization snapshot.
- [x] 2.2 Filter later same-authorization state permissions through the revoked permission floor without leaking internal metadata to runtime events.
- [x] 2.3 Preserve reset behavior when a new authorization id is approved by the observed host.

## 3. Tests

- [x] 3.1 Add integration coverage for stale active state after revoke-permission control.
- [x] 3.2 Add integration coverage for stale active state after permission-revoked confirmation.
- [x] 3.3 Add integration coverage for new authorization id reset behavior and secret-safe diagnostics.

## 4. Verification and Review

- [x] 4.1 Run focused agent-shell integration tests for viewer revocation floor behavior.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
- [x] 4.6 Complete a security review for authorization and revocation handling.
