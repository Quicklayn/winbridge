## 1. Audit Redaction

- [x] 1.1 Expand audit detail sensitive-key detection for common auth/session secret names.
- [x] 1.2 Preserve safe non-secret authorization identifiers such as `authorizationId`.
- [x] 1.3 Add focused protocol audit tests for expanded redaction in nested objects and arrays.
- [x] 1.4 Add audit sink persistence coverage for the expanded redaction key set.

## 2. Documentation and Specs

- [x] 2.1 Update security documentation to list the expanded audit redaction key coverage.
- [x] 2.2 Sync the accepted delta requirement into `openspec/specs/audit-foundation/spec.md`.

## 3. Verification and Review

- [x] 3.1 Run focused audit redaction tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete security review for audit redaction behavior.
- [x] 3.4 Archive the completed OpenSpec change after validation.
