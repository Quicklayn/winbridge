## 1. Authorization Schema

- [x] 1.1 Add schema validation that rejects `revoked` authorization records with `visibleToHost: false`.
- [x] 1.2 Add schema validation that rejects `terminated` authorization records with `visibleToHost: false`.
- [x] 1.3 Add schema validation that rejects `expired` authorization records with activation history and `visibleToHost: false`.
- [x] 1.4 Preserve accepted parsing for pre-access `denied` and non-activated `expired` records with `visibleToHost: false`.

## 2. Tests

- [x] 2.1 Add focused protocol authorization tests for invisible post-activation terminal records.
- [x] 2.2 Add focused protocol authorization tests for accepted visible terminal and pre-access terminal records.
- [x] 2.3 Run focused protocol authorization tests.

## 3. Verification

- [x] 3.1 Complete security review for auth schema validation impact on consent, visibility, terminal states, action authorization, and audit evidence.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Archive the OpenSpec change after implementation is verified.
