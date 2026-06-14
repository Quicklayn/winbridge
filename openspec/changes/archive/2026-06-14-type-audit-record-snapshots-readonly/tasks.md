## 1. Type Contract

- [x] 1.1 Mark returned `AuditRecord` snapshots read-only at the exported type level, including nested actor, target, and detail metadata.
- [x] 1.2 Keep `AuditRecordInput` and `AuditDetail` construction types mutable-friendly.
- [x] 1.3 Mark `MemoryAuditSink.records()` as returning a read-only audit record history view.

## 2. Tests

- [x] 2.1 Update audit immutability tests so intentional mutation attempts use explicit mutable test casts.
- [x] 2.2 Run focused protocol and audit-log tests.

## 3. Verification

- [x] 3.1 Review the audit type-only change for consent evidence, authorization evidence, audit persistence, redaction, logging, and abuse-resistance impact.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Archive the OpenSpec change after implementation is verified.
