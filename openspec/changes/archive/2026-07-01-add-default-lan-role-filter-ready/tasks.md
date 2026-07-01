## 1. Default LAN Role-Filter Readiness

- [x] 1.1 Add default `lan-role-filter-relay-command`, `lan-role-filter-host-command`, and `lan-role-filter-viewer-command` plan steps.
- [x] 1.2 Wire those steps to the existing LAN relay/agent role-filter readiness parsers.
- [x] 1.3 Preserve role-scoped readiness plans without adding unrelated LAN role checks.
- [x] 1.4 Keep output bounded to fixed check metadata on drift or subprocess failure.

## 2. Tests and Documentation

- [x] 2.1 Add plan and success tests for default tokenized LAN role-filter coverage.
- [x] 2.2 Add fail-closed tests for default LAN role-filter drift.
- [x] 2.3 Update README wording so default readiness coverage matches implementation.
- [x] 2.4 Perform security review for tokenized LAN role-filter readiness and diagnostic redaction.

## 3. Verification

- [x] 3.1 Run focused readiness tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run `npm run openspec:validate`.
