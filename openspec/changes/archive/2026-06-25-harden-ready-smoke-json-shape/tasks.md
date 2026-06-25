## 1. Ready Smoke JSON Shape Hardening

- [x] 1.1 Reject top-level smoke JSON fields outside the ready-consumed bounded shape.
- [x] 1.2 Keep accepting default successful smoke JSON with `artifacts: "cleaned"`.
- [x] 1.3 Add focused tests for unexpected top-level fields and bounded output.

## 2. Verification

- [x] 2.1 Run focused ready helper tests.
- [x] 2.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 3. Review

- [x] 3.1 Review safety invariants and archive the change.
