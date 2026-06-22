## 1. Implementation

- [x] 1.1 Extend the MVP smoke check to extract the viewer surface mutation token safely.
- [x] 1.2 Extend the MVP smoke check to POST one bounded pointer command to `/input`.
- [x] 1.3 Update CLI success output and docs to report input-path verification.

## 2. Tests

- [x] 2.1 Add focused tests for token extraction without leaking raw tokens on failure.
- [x] 2.2 Add focused tests that the smoke plan still excludes Windows capture, host OS input application, and browser automation.

## 3. Verification

- [x] 3.1 Run focused smoke tests.
- [x] 3.2 Run `npm run mvp:smoke -- --timeout-ms 45000`.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
