## 1. Implementation

- [x] 1.1 Store a frozen validated rate-limit options snapshot inside `SlidingWindowRateLimiter`.
- [x] 1.2 Add focused tests proving caller mutation after construction cannot change rate-limit decisions.

## 2. Verification

- [x] 2.1 Run focused relay rate-limit tests.
- [x] 2.2 Complete security review for the relay abuse-protection diff.
- [x] 2.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.4 Sync the completed OpenSpec delta into main specs and archive the change.
