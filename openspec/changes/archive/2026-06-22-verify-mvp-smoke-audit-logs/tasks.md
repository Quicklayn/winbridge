## 1. Smoke Runner

- [x] 1.1 Poll host and viewer audit JSONL paths for bounded schema-like audit
  records before reporting smoke success.
- [x] 1.2 Add bounded audit success metadata and safe `audit-not-ready` failure
  handling without exposing raw audit contents or paths.

## 2. Tests and Docs

- [x] 2.1 Add focused smoke-runner tests for audit-log validation, text/JSON
  success output, and safe failure output.
- [x] 2.2 Update README smoke documentation to include audit-log verification.
- [x] 2.3 Run focused tests, `npm run check`, `npm test`, `npm run build`, and
  OpenSpec validation.
