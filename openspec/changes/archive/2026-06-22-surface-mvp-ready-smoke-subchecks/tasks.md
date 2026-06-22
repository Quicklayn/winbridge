## 1. Ready Helper

- [x] 1.1 Invoke the included smoke check in JSON mode and capture child output
  internally.
- [x] 1.2 Parse only fixed safe smoke subchecks and attach them to ready text and
  JSON output.
- [x] 1.3 Fail closed with bounded reasons when smoke JSON is malformed or
  unexpected.

## 2. Tests and Docs

- [x] 2.1 Add focused ready-helper tests for smoke JSON subchecks, malformed
  smoke JSON, and no raw child output leakage.
- [x] 2.2 Update README ready documentation for smoke subchecks.
- [x] 2.3 Run focused tests, `npm run check`, `npm test`, `npm run build`, and
  OpenSpec validation.
