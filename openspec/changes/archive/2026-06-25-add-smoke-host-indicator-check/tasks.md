## 1. Smoke Indicator Check

- [x] 1.1 Add a fixed safe smoke subcheck for host active visible indicator readiness.
- [x] 1.2 Match only bounded indicator metadata and fail with `indicator-not-ready`.
- [x] 1.3 Keep smoke success/failure output free of raw child output and authorization ids.

## 2. Ready Aggregation And Docs

- [x] 2.1 Include the `indicator` subcheck in ready helper smoke allow-lists and formatting.
- [x] 2.2 Document host indicator smoke coverage in README.

## 3. Tests

- [x] 3.1 Add focused smoke tests for active indicator matching and bounded failure metadata.
- [x] 3.2 Add focused ready-helper tests for indicator subcheck aggregation.

## 4. Verification

- [x] 4.1 Run focused smoke and ready helper tests.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 5. Review

- [x] 5.1 Review visibility/log safety invariants and archive the change.
