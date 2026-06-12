## 1. Shared Audit Redaction

- [x] 1.1 Redact common display-name detail keys through shared audit detail redaction.
- [x] 1.2 Redact common private reason detail keys through shared audit detail redaction.
- [x] 1.3 Preserve `reasonCode`, `reasonConfigured`, `authorizationId`, and existing safe metadata fields.

## 2. Tests And Docs

- [x] 2.1 Add protocol audit redaction tests for recursive display-name and private reason detail keys.
- [x] 2.2 Add protocol `audit-event` parsing/encoding coverage for the stronger detail redaction.
- [x] 2.3 Add file audit sink coverage proving persisted JSONL redacts the new private detail keys while preserving safe metadata.
- [x] 2.4 Update operator-facing security/architecture docs for display-name and private reason detail redaction.

## 3. Verification

- [x] 3.1 Run focused protocol and audit-log tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Run a security review for the audit/log redaction diff.
