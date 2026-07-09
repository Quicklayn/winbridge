## 1. Audit Summary Diagnostics

- [x] 1.1 Compute deterministic missing role/flag evidence identifiers from the strict required evidence set.
- [x] 1.2 Attach sanitized missing evidence metadata to strict `missing-required-evidence` failures.
- [x] 1.3 Format text and JSON audit-summary failures with bounded missing evidence only for strict evidence failures.

## 2. Trial Evidence Delegation

- [x] 2.1 Preserve and format delegated missing evidence metadata in `mvp:trial -- --evidence` failures.
- [x] 2.2 Update README and main `mvp-audit-summary` OpenSpec spec.
- [x] 2.3 Perform a security review covering audit-log diagnostics and redaction.

## 3. Tests and Verification

- [x] 3.1 Add focused audit-summary and trial tests for missing evidence diagnostics, wrong-role evidence, and unrelated failures.
- [x] 3.2 Run focused audit-summary and trial tests.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
