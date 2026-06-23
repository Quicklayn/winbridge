## 1. Smoke Input Check

- [x] 1.1 Add a bounded keyboard-with-modifiers `/input` probe to the smoke input step.
- [x] 1.2 Keep the existing public smoke check names, bounded output, and `input-not-ready` failure reason.
- [x] 1.3 Preserve static smoke scope with no browser automation and no host OS input application.

## 2. Tests

- [x] 2.1 Add focused tests for pointer and keyboard surface input probes.
- [x] 2.2 Run focused smoke tests.
- [x] 2.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 3. Review

- [x] 3.1 Review input-safety invariants before archive.
