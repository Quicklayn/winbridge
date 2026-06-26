## 1. Smoke Status Readiness

- [x] 1.1 Strengthen the smoke status helper to require active visible status, signal acknowledgement, and pointer/keyboard readiness booleans.
- [x] 1.2 Reject known unsafe status metadata without exposing raw response values.
- [x] 1.3 Keep the fixed `signal` subcheck and bounded `signal-not-ready` failure shape unchanged.

## 2. Tests And Documentation

- [x] 2.1 Update focused smoke tests for sanitized ready status, incomplete readiness, and unsafe metadata rejection.
- [x] 2.2 Update README smoke documentation for the stricter status readiness check.

## 3. Verification And Review

- [x] 3.1 Run focused smoke tests and real `mvp:smoke -- --json`.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Review status, token, local surface, child-output, audit, input, and no-leak invariants before archiving.
