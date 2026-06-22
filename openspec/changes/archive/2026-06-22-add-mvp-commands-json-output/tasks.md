## 1. MVP Increments

- [x] 1.1 Emit bounded JSON for the full MVP session command plan.
- [x] 1.2 Emit bounded JSON for preflight-only command plan.
- [x] 1.3 Reject malformed or duplicate JSON/preflight flag usage without raw value leakage.
- [x] 1.4 Document JSON command-kit usage in README.
- [x] 1.5 Validate and archive the OpenSpec change.

## 2. Verification

- [x] 2.1 Run focused MVP command-kit tests.
- [x] 2.2 Run `npm run mvp:commands -- --json`.
- [x] 2.3 Run `npm run mvp:commands -- --preflight-only --json`.
- [x] 2.4 Run `npm run check`.
- [x] 2.5 Run `npm run openspec:validate`.
- [x] 2.6 Run strict OpenSpec validation for this change.
