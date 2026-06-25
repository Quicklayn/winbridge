## 1. Lifecycle Smoke Behavior

- [x] 1.1 Add a fixed safe lifecycle smoke subcheck after happy-path input checks.
- [x] 1.2 Drive an existing explicit host-side lifecycle control during smoke.
- [x] 1.3 Verify token-protected viewer surface input is rejected after lifecycle authorization loss.
- [x] 1.4 Keep cleanup behavior and diagnostics bounded for lifecycle failures.

## 2. Ready Aggregation And Docs

- [x] 2.1 Include the lifecycle subcheck in ready helper smoke aggregation allow-lists.
- [x] 2.2 Document lifecycle-denial smoke coverage in README.

## 3. Tests

- [x] 3.1 Add focused smoke tests for lifecycle subcheck success/failure and bounded JSON shape.
- [x] 3.2 Add focused ready-helper tests for lifecycle subcheck aggregation.

## 4. Verification

- [x] 4.1 Run focused smoke and ready helper tests.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 5. Review

- [x] 5.1 Review lifecycle/input safety invariants and archive the change.
