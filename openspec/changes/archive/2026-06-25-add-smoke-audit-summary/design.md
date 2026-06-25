## Context

`mvp:smoke` starts a bounded local relay, host, and viewer using static frames,
visible host approval, local audit paths, loopback viewer surface checks,
signal readiness, bounded input checks, and lifecycle denial checks. The helper
currently treats audit readiness as a boolean: each configured audit file must
contain at least one bounded schema-like JSONL record.

## Goals / Non-Goals

**Goals:**

- Parse the existing local smoke audit files read-only after audit readiness
  succeeds.
- Emit a fixed audit summary shape with role-local record counts, outcome
  counts, and known coverage booleans for consent, frame, input, and lifecycle
  evidence.
- Keep ready aggregation strict: accept only the fixed bounded summary shape
  and reject smoke JSON with unexpected fields.
- Preserve metadata-only output and avoid raw audit content leakage.

**Non-Goals:**

- No new audit sink, schema migration, or production telemetry.
- No native capture, OS input, browser automation, clipboard, file transfer,
  diagnostics collection, service/startup/installer, privilege elevation, or
  unattended behavior.
- No generalized log viewer and no printing local audit paths.

## Decisions

- Keep implementation inside the smoke helper instead of adding a new command
  so `mvp:ready --include-smoke` can reuse the same bounded result.
- Do not surface raw audit action strings. Internally map a small allow-list of
  expected WinBridge action names to fixed booleans such as
  `authorizationActive`, `screenFrameOutput`, `inputSent`, and
  `permissionRevoked`.
- Treat malformed or oversized logs as audit-not-ready. A summary is produced
  only after the existing readiness gate has succeeded for both smoke audit
  files.

## Risks / Trade-offs

- Summary parsing can become too strict if audit actions evolve. Mitigation:
  keep summary coverage booleans additive and use record/outcome counts as the
  stable baseline.
- Summary output could leak sensitive data if it mirrors log content.
  Mitigation: fixed field names only; no event ids, actors, targets, details,
  reasons, action strings, paths, or raw JSONL text.
