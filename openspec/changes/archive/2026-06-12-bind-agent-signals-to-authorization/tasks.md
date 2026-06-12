## 1. Runtime Gates

- [x] 1.1 Add a secret-safe helper that extracts a string `authorizationId` from signal payloads without logging payload keys or values.
- [x] 1.2 Require matching payload authorization id for public host/viewer signal sends after active visible authorization is confirmed.
- [x] 1.3 Require matching payload authorization id for host/viewer inbound signal handling before received-event emission or signal summary logging.

## 2. Tests And Documentation

- [x] 2.1 Add integration coverage for missing and mismatched outbound signal authorization ids.
- [x] 2.2 Add integration coverage for ignored inbound signals with missing or mismatched authorization ids and allowed matching inbound signals.
- [x] 2.3 Update architecture/security docs if the runtime behavior needs explicit operator guidance.

## 3. Verification

- [x] 3.1 Run focused agent-shell integration tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Run a security review for the authorization/signaling/logging diff.
