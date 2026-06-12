## 1. Implementation

- [x] 1.1 Reject token-protected relay connections unless exactly one `token` query parameter is present.
- [x] 1.2 Preserve successful single-token relay connections and existing invalid-token close behavior.
- [x] 1.3 Keep token-denial audit records secret-safe without raw presented or configured token values.
- [x] 1.4 Update README and security/architecture documentation for singular relay token query presentation.

## 2. Verification

- [x] 2.1 Add focused relay integration coverage for duplicate token query rejection and accepted single-token joins.
- [x] 2.2 Run focused relay integration tests.
- [x] 2.3 Complete security review for the relay token validation diff.
- [x] 2.4 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.5 Sync the completed OpenSpec delta into main specs and archive the change.
