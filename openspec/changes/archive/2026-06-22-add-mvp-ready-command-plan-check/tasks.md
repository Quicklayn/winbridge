## 1. Ready Helper

- [x] 1.1 Add a default `command-plan` step to the `mvp:ready` plan after native preflight and before optional smoke.
- [x] 1.2 Parse and validate bounded command-kit JSON without exposing raw generated command strings or child output.
- [x] 1.3 Update ready text and JSON formatting tests for the new bounded check order and failure behavior.

## 2. Documentation And Review

- [x] 2.1 Update README readiness guidance to mention command-plan validation.
- [x] 2.2 Review the change for consent-first safety invariants and confirm it remains non-executing.

## 3. Verification

- [x] 3.1 Run focused `mvp-ready` tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run strict OpenSpec validation.
