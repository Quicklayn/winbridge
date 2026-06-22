## 1. Ready Smoke Parsing

- [x] 1.1 Add strict parsing for bounded smoke success and failure subchecks.
- [x] 1.2 Preserve safe smoke failure subchecks in ready results while keeping aggregate reasons bounded.

## 2. Output Formatting

- [x] 2.1 Include fixed safe smoke subchecks in JSON output for failed included smoke checks.
- [x] 2.2 Include fixed safe smoke subchecks in text output for failed included smoke checks without raw child output.

## 3. Verification

- [x] 3.1 Add focused ready helper tests for smoke failure subcheck propagation and malformed smoke failure rejection.
- [x] 3.2 Run focused ready helper tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
