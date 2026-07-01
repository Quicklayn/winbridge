## Context

The existing MVP smoke helper already parses host/viewer audit JSONL internally
to prove bounded smoke evidence. That parser is smoke-specific and not exposed
as an operator-facing command for a real two-PC trial. The audit persistence
layer guarantees schema validation and redaction at write time, but a
post-run command still needs to fail closed if files are missing, malformed, or
unsafe to summarize.

## Goals / Non-Goals

**Goals:**
- Provide a read-only `mvp:audit-summary` command for local post-run evidence.
- Require explicit `--host <path>` and `--viewer <path>` arguments.
- Emit only fixed counts, fixed coverage flags, and safe reason codes.
- Keep all raw audit records, details, paths, tokens, pairing codes, display
  names, private reasons, screen/input/clipboard/file/diagnostic content, and
  command text out of output.
- Fail closed on malformed paths, files, lines, audit record shapes, oversized
  inputs, and unsafe metadata.

**Non-Goals:**
- No live runtime checks, network access, capture, input, browser automation,
  remote log retrieval, log upload, service/startup behavior, persistence, or
  privilege changes.
- No raw log viewer, no event timeline, and no debugging dump output.
- No production audit backend or identity attestation.

## Decisions

1. Use explicit host/viewer paths and do not infer default files. Explicit
   paths prevent accidentally reading unrelated logs and keep the command
   predictable for two-PC trials.

2. Summarize by action/outcome only. Details may contain redacted metadata, but
   the helper does not need details to prove MVP evidence and should not echo
   them.

3. Keep a small fixed evidence vocabulary:
   authorization approved, active visible authorization, screen frame sent,
   screen frame output, input sent, permission revoked, and disconnect/terminal
   lifecycle evidence. This maps to the current MVP workflow without becoming
   a generic audit explorer.

## Risks / Trade-offs

- Real trial logs may include actions outside the fixed vocabulary. Mitigate by
  ignoring unknown safe actions rather than printing them.
- Operators may want raw event details for troubleshooting. Mitigate by
  directing debugging to local trusted file inspection; the MVP helper remains
  bounded and secret-safe.
- Audit files can grow large. Mitigate with file and line limits and fixed
  failure reasons.
