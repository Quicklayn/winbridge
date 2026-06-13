## Context

WinBridge uses structured audit records for relay decisions, consent workflow events, and development file sinks. These records already redact sensitive detail fields and reject blank/untrimmed semantic fields. However, invisible controls or directional formatting characters in action, top-level reason, target type, or protocol audit-event action metadata can make logs misleading while still passing validation.

## Goals / Non-Goals

**Goals:**

- Reject ASCII control characters in audit semantic metadata.
- Reject Unicode bidi and zero-width formatting controls, including `U+FEFF`, in audit semantic metadata.
- Keep rejection diagnostics generic and free of raw action/reason/target text.
- Preserve existing audit detail redaction and safe reason preservation behavior.
- Prove relay rejects malformed protocol audit-event action metadata before forwarding.

**Non-Goals:**

- No automatic normalization, trimming, or repair of malformed audit metadata.
- No changes to audit detail extensibility or redaction key classification beyond semantic metadata validation.
- No new remote assistance capability or production authentication/authorization mechanism.

## Decisions

- Add local explicit unsafe-character helpers in audit and protocol message modules.
  - Rationale: current validators are colocated with their schemas; keeping changes local minimizes blast radius.

- Keep `reasonConfigured`, `reasonCode`, and other non-sensitive detail metadata behavior unchanged.
  - Rationale: this change targets semantic top-level metadata, not extensible detail payloads already governed by JSON compatibility and redaction.

- Add relay integration coverage for malformed `audit-event.action`.
  - Rationale: protocol schema tests prove validation; relay coverage proves malformed audit protocol metadata is not forwarded and remains secret-safe.

## Risks / Trade-offs

- [Risk] Duplicate denylist helpers can drift across modules. -> Mitigation: add focused tests in all touched validation boundaries and consider a later shared helper refactor.
- [Risk] Some local tooling could emit action strings with accidental control characters. -> Mitigation: fail closed because audit metadata must be unambiguous.
- [Risk] This touches audit/log paths. -> Mitigation: run focused tests, full gates, strict OpenSpec validation, and security review before archive.
