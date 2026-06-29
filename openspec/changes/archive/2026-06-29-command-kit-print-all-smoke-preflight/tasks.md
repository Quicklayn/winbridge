## 1. Command Kit Output

- [x] 1.1 Add a shared all-smoke preflight command renderer for human and JSON
  command-kit output.
- [x] 1.2 Include the all-smoke preflight gate in full-session and
  preflight-only text output without executing anything.
- [x] 1.3 Include a fixed `preflight.ready-all-smoke` entry in JSON command
  plans and keep token-env references secret-safe.

## 2. Ready Validation And Tests

- [x] 2.1 Update `mvp:ready` command-plan validation to require
  `preflight.ready-all-smoke`.
- [x] 2.2 Add focused tests for text output, JSON output, token-env rendering,
  preflight-only output, and readiness validation drift.
- [x] 2.3 Update README command-kit/preflight documentation.
- [x] 2.4 Run security review for token/relay command rendering boundaries.

## 3. Verification

- [x] 3.1 Run focused command/ready tests, command JSON smoke checks,
  `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
