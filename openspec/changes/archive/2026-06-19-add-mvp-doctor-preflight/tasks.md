## 1. Implementation

- [x] 1.1 Add a root `mvp:doctor` script.
- [x] 1.2 Implement a read-only doctor CLI with bounded readiness checks.
- [x] 1.3 Document the doctor command in README.

## 2. Tests

- [x] 2.1 Add focused doctor tests for pass/fail readiness.
- [x] 2.2 Add focused tests that doctor diagnostics do not echo raw paths or secrets.
- [x] 2.3 Add focused tests that doctor does not import child process, network, HTTP, or native adapter APIs.

## 3. Verification

- [x] 3.1 Run focused doctor tests.
- [x] 3.2 Run `npm run mvp:doctor`.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
