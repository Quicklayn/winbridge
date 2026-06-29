## 1. Implementation

- [x] 1.1 Reject tokenless full-session `--relay-host` command plans.
- [x] 1.2 Reject tokenless full-session non-loopback `--relay` command plans.
- [x] 1.3 Update `mvp:ready` LAN command-plan generation and readiness parsing to require token-env.

## 2. Tests and Docs

- [x] 2.1 Add command-kit tests for tokenless LAN rejection and tokenized LAN acceptance.
- [x] 2.2 Add ready-helper tests for tokenized LAN command-plan generation and drift detection.
- [x] 2.3 Update operator/security docs for LAN token-env requirement.
- [x] 2.4 Add a security review note for the fail-closed command-generation change.

## 3. Verification

- [x] 3.1 Run `npm run check`.
- [x] 3.2 Run `npm test`.
- [x] 3.3 Run `npm run build`.
- [x] 3.4 Run `npm run openspec:validate`.
