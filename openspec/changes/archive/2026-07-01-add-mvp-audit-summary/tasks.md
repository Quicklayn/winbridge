## 1. Planning and Safety

- [x] 1.1 Validate the OpenSpec change strictly before implementation.
- [x] 1.2 Review audit/log safety boundaries and confirm the helper remains read-only.

## 2. Audit Summary Helper

- [x] 2.1 Add root `mvp:audit-summary` script wiring.
- [x] 2.2 Implement bounded CLI parsing for `--host`, `--viewer`, and `--json`.
- [x] 2.3 Implement safe local audit file reading, JSONL parsing, and fixed evidence summarization.
- [x] 2.4 Keep success and failure output bounded without paths, raw records, identifiers, details, or secrets.

## 3. Tests and Docs

- [x] 3.1 Add tests for successful text and JSON summaries.
- [x] 3.2 Add tests for unsafe paths, malformed files, oversized input, and redaction guarantees.
- [x] 3.3 Update README operator docs for post-run audit summary usage.
- [x] 3.4 Perform a security review for log handling and output redaction.

## 4. Verification

- [x] 4.1 Run targeted audit-summary tests.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
