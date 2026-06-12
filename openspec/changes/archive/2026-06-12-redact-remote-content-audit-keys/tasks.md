## 1. Shared Audit Redaction

- [x] 1.1 Extend shared audit detail key redaction for clipboard, file-transfer, and diagnostics content names.
- [x] 1.2 Extend top-level audit reason marker redaction for clipboard, file-transfer, and diagnostics content markers.
- [x] 1.3 Add focused protocol audit tests covering shared detail redaction, audit-event parsing/encoding, safe `authorizationId`, and reason redaction.

## 2. Persistence And Documentation

- [x] 2.1 Add file audit sink coverage proving newly sensitive detail keys are redacted before JSONL persistence.
- [x] 2.2 Update security and architecture docs to name the expanded audit redaction boundary.

## 3. Verification And Archive

- [x] 3.1 Run focused audit tests.
- [x] 3.2 Complete security review for the audit/log redaction diff.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Sync the completed OpenSpec delta into main specs and archive the change.
