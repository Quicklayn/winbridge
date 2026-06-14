## 1. Authorization Schema

- [x] 1.1 Add schema validation that rejects `revoked`, `terminated`, and visible `expired` authorization records missing `approvedAt`.
- [x] 1.2 Add schema validation that rejects `revoked`, `terminated`, and visible `expired` authorization records missing `activatedAt`.
- [x] 1.3 Preserve accepted parsing for valid terminal records with ordered approval, activation, and terminal timestamp history.
- [x] 1.4 Preserve accepted parsing for valid `denied` and non-visible `expired` records without approval or activation history.

## 2. Tests

- [x] 2.1 Add focused protocol authorization tests for terminal records missing `approvedAt` or `activatedAt`.
- [x] 2.2 Add focused protocol authorization tests for accepted valid terminal, denied, and non-visible expired records.
- [x] 2.3 Run focused protocol authorization tests.

## 3. Verification

- [x] 3.1 Complete security review for auth schema validation impact on consent, visibility, revocation, terminal states, action authorization, and audit evidence.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Archive the OpenSpec change after implementation is verified.
