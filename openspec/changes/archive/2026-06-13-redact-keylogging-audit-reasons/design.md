## Context

Audit records are the accountability backbone for WinBridge's consent-first
remote assistance model. The shared audit layer already validates and redacts
top-level `reason` strings before they are returned or passed through console,
file, relay, or agent audit sinks. Detail-key redaction covers keylogging-shaped
fields recursively, but reason-string pattern matching does not currently include
`keylog` or `keylogger` markers.

## Goals / Non-Goals

**Goals:**

- Redact top-level audit reasons that contain obvious keylogging markers and a
  raw value.
- Keep safe bounded reason codes inspectable.
- Apply the behavior through existing shared audit creation so memory, console,
  file, protocol encoding, relay, and agent-shell callers inherit the same
  result.
- Prove the behavior with focused protocol and file-sink tests.

**Non-Goals:**

- Do not add keylogging, input capture, screen capture, clipboard access,
  diagnostics, file transfer, hidden sessions, persistence, service startup,
  installer behavior, privilege elevation, evasion, or Windows prompt bypass.
- Do not introduce new audit record fields, change the JSONL format, or add
  dependencies.
- Do not redact safe fixed reason codes merely because they mention a denied
  capability without carrying raw private content.

## Decisions

1. Extend the shared reason marker pattern.

   Rationale: `createAuditRecord()` is the single entry point used by
   development audit sinks and protocol audit-event normalization, so adding
   markers there keeps behavior consistent. A separate file-sink-only redaction
   path would leave memory/console/protocol behavior divergent.

   Alternative considered: reject keylogging-shaped reasons instead of
   redacting them. Rejection is stricter but would make audit emission brittle
   during failure paths; redaction preserves accountability without storing raw
   private text.

2. Require marker plus value rather than redacting any use of the word.

   Rationale: existing reason redaction treats strings like `clipboard denied`
   and `file transfer denied` as safe bounded metadata. The keylogging rule
   should similarly redact `keylog: raw-value`, `keylogger raw-value`, or
   `rawKeylog=raw-value` while preserving future fixed metadata-only denial
   strings when they do not carry private content.

## Risks / Trade-offs

- Broader pattern matching could redact a benign diagnostic reason. Mitigation:
  keep the rule aligned with existing marker-plus-value assignment patterns.
- Narrow matching could miss unusual keylogging spellings. Mitigation: include
  common collapsed, spaced, hyphenated, and underscored forms through the shared
  marker pattern and tests.
