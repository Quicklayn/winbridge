## 1. Authorization Schema

- [x] 1.1 Add schema validation that rejects `denied`, `revoked`, `terminated`, and `expired` authorization records without `reason`.
- [x] 1.2 Preserve existing canonical reason validation for terminal records with malformed reasons.
- [x] 1.3 Preserve accepted parsing for non-terminal authorization records without `reason`.
- [x] 1.4 Preserve state-machine transition outputs that already record terminal reasons.

## 2. Tests

- [x] 2.1 Add focused protocol authorization tests for terminal records missing `reason`.
- [x] 2.2 Add focused protocol authorization tests for accepted terminal records with valid reasons and non-terminal records without reasons.
- [x] 2.3 Run focused protocol authorization tests.

## 3. Verification

- [x] 3.1 Complete security review for auth schema validation impact on consent, visibility, terminal states, action authorization, and audit evidence.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
- [x] 3.6 Archive the OpenSpec change after implementation is verified.
