## 1. Ready Plan

- [x] 1.1 Add a fixed token command-plan validation step to the default ready plan.
- [x] 1.2 Keep ready output bounded and avoid surfacing generated token command strings.

## 2. Parser

- [x] 2.1 Extend command-plan readiness parsing to validate host/viewer token environment references.
- [x] 2.2 Fail closed on missing, wrong, or malformed token command-plan metadata.

## 3. Tests

- [x] 3.1 Add focused ready helper tests for token command-plan success and failure.
- [x] 3.2 Run focused ready helper tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
