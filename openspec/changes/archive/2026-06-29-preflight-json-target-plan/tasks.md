## 1. Command Kit Parsing And Output

- [x] 1.1 Allow `--only preflight --json` and render the existing bounded
  preflight JSON command plan.
- [x] 1.2 Keep JSON rejected for runtime role filters and ambiguous preflight
  selector combinations.

## 2. Ready Validation And Tests

- [x] 2.1 Add `mvp:ready` validation for the preflight JSON target plan.
- [x] 2.2 Add focused tests for the new JSON preflight alias, rejected runtime
  JSON role filters, and readiness drift validation.
- [x] 2.3 Update README command-kit/readiness documentation.
- [x] 2.4 Run security review for the command rendering and readiness
  validation boundary.

## 3. Verification

- [x] 3.1 Run focused command/ready tests, CLI JSON smoke checks,
  `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
