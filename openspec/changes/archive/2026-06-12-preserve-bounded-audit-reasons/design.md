## Context

The shared audit layer redacts top-level reasons before memory, console, or file
sinks emit records. The recent implementation intentionally catches marker/value
forms such as `Authorization: raw-token`, but a broad marker match can also
redact fixed strings like `Relay token rate limit exceeded` that do not contain
secret values.

## Goals / Non-Goals

**Goals:**

- Preserve known safe bounded reason strings used by development relay/runtime
  diagnostics.
- Keep secret-bearing marker/value reason strings redacted.
- Cover both positive and negative cases with focused tests.

**Non-Goals:**

- Do not weaken audit detail redaction.
- Do not allow arbitrary user-provided reason text into logs as a substitute for
  bounded caller behavior.
- Do not change protocol message schemas or wire behavior.

## Decisions

- Keep a small explicit safe-reason allowlist in `packages/protocol/src/audit.ts`.
  Alternative considered: infer safety from natural language, but fixed
  allowlisting is more predictable and avoids accidental leakage.
- Apply the allowlist before sensitive marker matching. This preserves vetted
  constants while continuing to redact any unlisted reason with marker/value
  secret shape.
- Add tests for safe relay token reasons and for unsafe free-form token reasons
  with an explicit value after the marker.

## Risks / Trade-offs

- The allowlist can drift from runtime constants -> mitigation: keep tests close
  to shared audit redaction and add new fixed reasons deliberately.
- Overly broad allowlisting could leak data -> mitigation: only fixed,
  metadata-only strings are allowlisted; strings with interpolated values stay
  subject to redaction.
