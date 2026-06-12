## Context

WinBridge treats clipboard access, file transfer, and diagnostics as sensitive remote-assistance actions. The current audit redaction list covers tokens, credentials, pairing codes, keystrokes, screenshots, screen data, and common authentication keys, but it does not explicitly cover obvious clipboard, file-transfer, or diagnostics content names.

The shared audit helpers are used by memory, console, file, relay, agent-shell, and protocol `audit-event` flows, so a single redaction update can protect all current development audit surfaces.

## Goals / Non-Goals

**Goals:**

- Redact audit detail keys that clearly indicate clipboard contents, file-transfer contents/data/bytes, or diagnostic contents/dumps at any nesting level.
- Redact top-level audit reasons that include those sensitive markers plus raw values.
- Preserve non-secret lifecycle identifiers such as `authorizationId`.
- Verify shared audit helpers, protocol `audit-event` parsing/encoding, and file audit persistence.

**Non-Goals:**

- No clipboard sync, file transfer, diagnostics export, screen capture, input injection, native Windows service, installer, startup, or privilege elevation behavior.
- No free-form content inspection beyond existing reason marker checks and key-name indicators.
- No production audit backend or retention policy redesign.

## Decisions

1. Extend the shared audit redaction vocabulary.
   - Rationale: `createAuditRecord` and `redactAuditDetail` are the common path for current sinks and protocol audit-event normalization.
   - Alternative considered: add sink-specific filtering. That would leave protocol `audit-event` and in-memory audit surfaces inconsistent.

2. Use exact remote-content category matches plus specific content indicators.
   - Rationale: exact `clipboard`, `fileTransfer`, and `diagnostic(s)` keys are likely raw content containers, while `fileTransferId`, `diagnosticId`, and `diagnosticStatus` are useful non-secret metadata. Specific indicators such as `fileTransferContent`, `fileData`, and `diagnosticDump` catch content-bearing names without redacting every diagnostic or transfer metadata field.
   - Alternative considered: reject or redact any `file` key. That is too broad for audit metadata.

3. Keep `authorizationId` as an exact safe key.
   - Rationale: lifecycle identifiers are needed for debugging and audit correlation, and they are not bearer secrets.
   - Alternative considered: redact all authorization-prefixed keys. That would reduce useful audit traceability and contradict existing specs.

## Risks / Trade-offs

- Some benign audit metadata containing `clipboard` or `diagnostic` may be redacted -> Fail-closed redaction is acceptable for sensitive remote-assistance categories; future safe identifiers can be explicitly allowlisted through OpenSpec.
- Reason marker redaction may redact generic diagnostic reasons -> Preserve only fixed bounded reason strings by safe-listing them when needed.
- Key-name redaction cannot detect sensitive values under benign key names -> This remains defense-in-depth and does not replace capability-specific authorization and audit design.

## Migration Plan

This is a development redaction tightening. Existing audit records remain schema-compatible, but values under newly sensitive keys will become `[REDACTED]`. Rollback is a single revert if indicators prove too broad during development.

## Open Questions

None.
