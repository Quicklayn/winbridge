## 1. Implementation

- [x] 1.1 Add a fixed MVP entrypoint file list to `mvp:doctor`.
- [x] 1.2 Include the entrypoint check in doctor result formatting.
- [x] 1.3 Keep doctor non-executing and secret-safe.

## 2. Tests

- [x] 2.1 Add tests for successful entrypoint readiness output.
- [x] 2.2 Add tests for missing entrypoint failure without raw paths or secrets.
- [x] 2.3 Extend import-safety tests so doctor still avoids process, network, capture, and input APIs.

## 3. Verification

- [x] 3.1 Run focused doctor tests.
- [x] 3.2 Run `npm run mvp:doctor`.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
