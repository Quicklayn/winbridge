## 1. LAN Bind Validation

- [x] 1.1 Add strict LAN relay bind-host validation to `mvp:ready` command-plan parsing.
- [x] 1.2 Keep failure output bounded without echoing command text or relay URLs.

## 2. Documentation And Tests

- [x] 2.1 Add focused ready parser and aggregation tests for missing/wrong LAN bind.
- [x] 2.2 Document stricter LAN readiness validation in README.

## 3. Verification

- [x] 3.1 Run focused ready tests.
- [x] 3.2 Run `npm run mvp:ready -- --json`.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.

## 4. Review

- [x] 4.1 Review non-execution/no-leak invariants and archive the change.
