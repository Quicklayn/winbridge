# Design: Read-only audit record snapshot types

## Overview
`createAuditRecord()` deep-freezes validated and redacted audit records. `MemoryAuditSink` stores those immutable records and returns a fresh history array on inspection. The TypeScript API should describe returned audit evidence as read-only while preserving mutable input ergonomics for callers building audit records.

## Approach
- Keep a private mutable schema-inferred record type for `AuditRecordInput`.
- Export `AuditRecord` as a read-only snapshot type with read-only top-level fields, actor, target, and JSON detail metadata.
- Add read-only JSON snapshot helper types local to the audit module.
- Change `MemoryAuditSink.records()` to return `readonly AuditRecord[]`.
- Adjust tests to use local mutable casts only where mutation is the behavior under test.

## Security Rationale
Audit records are security evidence for consent, authorization, relay decisions, and failure paths. Runtime immutability already prevents tampering after creation. Type-level immutability reduces accidental evidence mutation in future code and keeps audit handling aligned with the consent-first safety model.

## Compatibility
This is a TypeScript compile-time hardening change. Runtime record data, JSON serialization, redaction, file/console output, in-memory ordering, and existing audit sink behavior remain unchanged. Callers that were intentionally mutating returned audit snapshots must copy records into mutable local objects first.

## Alternatives Considered
- Make `AuditDetail` globally read-only: rejected because that type is also useful for constructing audit details before validation.
- Freeze the `records()` returned array: rejected for this change because current runtime semantics intentionally return a fresh copy; type-level read-only history is sufficient and avoids a behavior change.
