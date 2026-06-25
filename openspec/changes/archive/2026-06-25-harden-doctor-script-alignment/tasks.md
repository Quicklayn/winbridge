## 1. Doctor Script Alignment

- [x] 1.1 Add bounded root script alignment validation for `dev:agent`, `dev:relay`, and `mvp:smoke`.
- [x] 1.2 Add fixed `script-misaligned` diagnostics without echoing script bodies or package JSON content.

## 2. Documentation And Tests

- [x] 2.1 Add focused doctor tests for aligned scripts and drifted scripts.
- [x] 2.2 Document the alignment check in README.

## 3. Verification

- [x] 3.1 Run focused doctor tests.
- [x] 3.2 Run `npm run mvp:doctor -- --json`.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 4. Review

- [x] 4.1 Review read-only/no-side-effect invariants and archive the change.
