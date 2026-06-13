## 1. OpenSpec

- [x] 1.1 Create proposal, design, delta specs, and tasks for keylogging audit reason redaction.
- [x] 1.2 Validate the active OpenSpec change in strict mode.

## 2. Implementation

- [x] 2.1 Extend shared audit reason redaction for keylogging-related markers with raw values.
- [x] 2.2 Add focused protocol audit tests for keylogging reason redaction and metadata-only preservation.
- [x] 2.3 Add focused file audit sink tests proving persisted JSONL omits raw keylogging reason text.
- [x] 2.4 Update security documentation for keylogging audit reason redaction.

## 3. Verification

- [x] 3.1 Run focused protocol and audit-log tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete a safety/security review for the audit logging diff.

## 4. Completion

- [x] 4.1 Archive the OpenSpec change after implementation and verification.
- [x] 4.2 Commit and push the completed increment to GitHub.
