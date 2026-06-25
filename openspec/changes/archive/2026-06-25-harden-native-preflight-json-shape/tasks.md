## 1. Native Preflight Hardening

- [x] 1.1 Validate PowerShell probe stdout as exact bounded `{ ok: true }` JSON.
- [x] 1.2 Fail malformed, empty, false, extra-field, non-object, array, or oversized probe output with existing bounded reason codes.
- [x] 1.3 Keep raw probe stdout and parse details out of human and JSON diagnostics.

## 2. Tests And Docs

- [x] 2.1 Add focused native preflight tests for strict probe JSON success markers and malformed output.
- [x] 2.2 Document strict native preflight probe marker validation in README.

## 3. Verification

- [x] 3.1 Run focused native preflight tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 4. Review

- [x] 4.1 Review native preflight safety invariants and archive the change.
