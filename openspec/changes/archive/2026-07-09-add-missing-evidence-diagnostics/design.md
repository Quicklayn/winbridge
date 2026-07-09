## Context

The strict MVP evidence gate already reads explicit local host and viewer
audit JSONL paths and fails closed when required role-bound evidence is
missing. Its current failure reason is intentionally coarse:
`missing-required-evidence`. That protects logs and identifiers, but it slows
down two-PC MVP trial debugging because the operator cannot tell which fixed
proof category did not appear.

## Goals / Non-Goals

**Goals:**

- Report fixed missing evidence identifiers for strict evidence failures.
- Keep identifiers role-bound, bounded, deterministic, and safe to print.
- Reuse the same diagnostics in `mvp:audit-summary` and delegated
  `mvp:trial -- --evidence` output.
- Preserve the existing fail-closed behavior and all audit parsing limits.

**Non-Goals:**

- No new audit record shapes or required evidence categories.
- No remote log collection, upload, discovery, or process orchestration.
- No capture, input, relay, browser, installer, startup, service, privilege,
  unattended-access, or production-auth behavior.
- No raw path, audit record, identifier, frame, screen, input, token, pairing,
  stdout, stderr, or child-output diagnostics.

## Decisions

1. Represent missing proof as fixed `role.flag` strings.

   Rationale: values such as `host.authorizationActive` and
   `viewer.inputSent` are actionable and do not derive from audit contents.
   Alternatives such as action names or record excerpts would be noisier and
   risk exposing implementation detail or sensitive context.

2. Attach missing evidence to the typed error, not to thrown raw records.

   Rationale: the strict gate already parses and summarizes logs locally. The
   failure object can carry sanitized metadata while formatters decide whether
   to emit text or JSON. This keeps CLI output bounded and avoids passing raw
   audit state through error messages.

3. Keep success output shape unchanged.

   Rationale: downstream readiness and fixture gates already consume the
   current success contract. The new behavior is only for strict failure
   diagnostics.

## Risks / Trade-offs

- Missing flags could be mistaken for complete evidence detail -> output will
  label them as missing fixed evidence only, and README/spec wording will
  state that raw audit logs remain local.
- JSON failure output shape expands from `{ ok, reason }` to include optional
  `missingEvidence` for one fixed reason -> tests and trial delegation will
  cover the new bounded shape.
- The same coverage flag can exist globally but still be missing in the
  expected role -> diagnostics will use role-bound required evidence, matching
  the strict gate semantics.
