## 1. Smoke Audit Summary

- [x] 1.1 Add a read-only bounded audit JSONL summary parser for smoke logs.
- [x] 1.2 Include fixed safe audit summary metadata in smoke success results.
- [x] 1.3 Keep smoke failure diagnostics bounded for malformed audit content.

## 2. Ready Aggregation And Docs

- [x] 2.1 Teach ready smoke JSON parsing to accept only the fixed audit summary shape.
- [x] 2.2 Preserve bounded audit summary metadata in ready JSON and human formatting.
- [x] 2.3 Document audit summary behavior and redaction limits in README.

## 3. Tests

- [x] 3.1 Add focused smoke tests for summary parsing, JSON shape, and leak prevention.
- [x] 3.2 Add focused ready-helper tests for accepting bounded summaries and rejecting unsafe shapes.

## 4. Verification

- [x] 4.1 Run focused smoke and ready helper tests.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 5. Review

- [x] 5.1 Review audit/log safety invariants and archive the change.
