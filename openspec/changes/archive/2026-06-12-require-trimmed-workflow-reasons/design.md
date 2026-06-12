## Context

WinBridge already treats workflow reasons as private metadata: protocol reasons are redacted from local sent/received events, audit detail reason fields are redacted, and CLI/runtime validation bounds lifecycle reason length. The remaining gap is canonicality: a non-blank reason with leading or trailing whitespace can pass validation and create different raw and displayed values.

## Goals / Non-Goals

**Goals:**

- Enforce trimmed workflow reason strings at shared protocol and authorization schema boundaries.
- Reject agent-shell CLI/runtime workflow reason options before relay connection or workflow emission when they are malformed.
- Keep reason redaction and secret-safe diagnostics unchanged.

**Non-Goals:**

- No automatic trimming or rewriting of user-provided reason text.
- No production identity, account, MFA, token lifecycle, relay authentication, or persistent audit store changes.
- No remote action, screen capture, input, clipboard, file transfer, reconnect, installer, service, startup, privilege, token, or native Windows API changes.

## Decisions

1. Reject untrimmed reasons instead of trimming them.
   - Rationale: fail-closed parsing keeps raw input, protocol payload, and audit/lifecycle state aligned. Silent trimming could hide ambiguous input and produce different values in error paths versus persisted records.
   - Alternative considered: trim in CLI/runtime only. Rejected because direct runtime and protocol callers would still be able to create non-canonical records.

2. Enforce the rule in both protocol message schemas and authorization record schemas.
   - Rationale: protocol messages and shared authorization records are separate trust boundaries. Both must reject malformed metadata before future clients rely on them.
   - Alternative considered: rely on protocol parse before creating records. Rejected because state-machine helpers are public package APIs and can be called without protocol messages.

3. Keep diagnostics generic.
   - Rationale: reason text may contain private lifecycle context. Existing local events, logs, and audit details redact reasons; this change should not add raw reason echoing in exceptions or usage output.
   - Alternative considered: include the invalid reason in parse errors for developer convenience. Rejected because private reason text must not leak through diagnostics.

## Risks / Trade-offs

- [Risk] Existing local scripts with padded `--pause-reason`, `--resume-reason`, `--revoke-reason`, or `--terminate-reason` will now fail. -> Mitigation: callers can pass the same reason without surrounding whitespace; this is a development metadata contract.
- [Risk] Stricter reason validation could be mistaken for production audit integrity. -> Mitigation: specs and docs continue to separate development metadata validation from production authentication and durable audit requirements.
