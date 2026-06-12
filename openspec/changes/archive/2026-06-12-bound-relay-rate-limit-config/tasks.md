## 1. Validation

- [x] 1.1 Add explicit safe upper bounds for `SlidingWindowRateLimiter` limits and windows.
- [x] 1.2 Apply the same bounds to environment-derived development rate-limit configuration before constructing the limiter.

## 2. Tests

- [x] 2.1 Add focused unit coverage for accepted maximum limit/window values.
- [x] 2.2 Add focused unit coverage rejecting over-bound constructor and environment values.

## 3. Documentation

- [x] 3.1 Document rate-limit limit and window ranges in README and security documentation.

## 4. Review And Verification

- [x] 4.1 Run a security review for the relay abuse-protection configuration diff.
- [x] 4.2 Run focused relay rate-limit tests.
- [x] 4.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.4 Archive the completed OpenSpec change after implementation and verification.
