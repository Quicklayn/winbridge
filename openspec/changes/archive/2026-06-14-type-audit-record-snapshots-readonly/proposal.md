# Change: Type audit record snapshots as read-only

## Why
Shared audit records and in-memory audit history are already immutable at runtime after validation and redaction. The exported TypeScript types still describe audit records and memory sink history views as mutable, which makes caller code appear able to edit trusted audit evidence even though runtime rejects those mutations.

This change aligns the public type contract with the existing immutable audit evidence behavior.

## What Changes
- Expose created `AuditRecord` values as read-only TypeScript snapshots, including nested actor, target, and detail metadata.
- Keep `AuditRecordInput` and `AuditDetail` mutable-friendly for callers that are constructing audit records before validation.
- Expose `MemoryAuditSink.records()` as a read-only history view.
- Update tests that intentionally attempt runtime mutation to use explicit mutable test casts.

## Safety Impact
- Touches audit type contracts and audit immutability tests.
- Does not change audit record JSON shape, redaction behavior, audit persistence, protocol messages, relay routing, authorization, capture, input, installer, startup, services, tokens, logs, or privilege behavior.
- Strengthens audit evidence integrity by making direct mutation of returned audit records a compile-time error for ordinary callers.

## Non-Goals
- No new remote access capability.
- No hidden sessions, stealth persistence, credential access, keylogging, AV/EDR evasion, or Windows prompt bypass.
- No changes to audit action taxonomy, redaction rules, storage backends, or workflow audit emission timing.
