## 1. Trial Helper

- [x] 1.1 Add `mvp:trial` to the root npm scripts.
- [x] 1.2 Implement `scripts/mvp-trial.mjs` plan mode with full and role-scoped bounded text/JSON output.
- [x] 1.3 Implement evidence mode argument validation and strict audit-summary delegation.

## 2. Tests and Documentation

- [x] 2.1 Add focused tests for default plan, JSON plan, role filters, malformed options, evidence success, evidence failure, and unsafe path rejection.
- [x] 2.2 Update README two-PC MVP guidance to use the trial helper.
- [x] 2.3 Perform a security review for audit-log path handling, delegation, non-executing plan mode, and diagnostic redaction.

## 3. Verification

- [x] 3.1 Run focused trial helper tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
