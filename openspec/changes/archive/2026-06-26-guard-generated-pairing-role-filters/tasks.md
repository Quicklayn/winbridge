## 1. Parser and Tests

- [x] 1.1 Reject `--generate-pairing` combined with any `--only` target before pairing generation.
- [x] 1.2 Add focused tests for role-filtered generated pairing rejection in both flag orders and bounded diagnostics.

## 2. Documentation and Spec

- [x] 2.1 Update MVP command kit docs/spec to state generated pairing is full-plan only and `--only` users must share an explicit pairing code.

## 3. Verification

- [x] 3.1 Run focused command-kit tests.
- [x] 3.2 Run repository verification (`npm run check`, `npm test`, `npm run build`, `npm run openspec:validate`, and `git diff --check`).
