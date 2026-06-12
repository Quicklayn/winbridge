## 1. Rate-Limit Environment Validation

- [x] 1.1 Reject leading-zero `*_LIMIT` and `*_WINDOW_MS` environment values before limiter construction.
- [x] 1.2 Preserve omitted defaults, canonical positive integer parsing, and existing minimum bounds.

## 2. Tests

- [x] 2.1 Add focused rate-limit tests for canonical configured values.
- [x] 2.2 Add focused rate-limit tests for leading-zero malformed values.
- [x] 2.3 Run focused relay rate-limit tests.

## 3. Specs, Docs, Verification, and Review

- [x] 3.1 Sync main relay abuse-protection spec and docs with canonical rate-limit env requirements.
- [x] 3.2 Run `npm run verify`.
- [x] 3.3 Perform a security review of rate-limit env validation, startup behavior, limiter construction, diagnostics, and OpenSpec impact.
