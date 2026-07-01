## Context

`mvp:smoke` already starts the explicit local development relay, host, and
viewer workflow and emits a bounded audit summary after audit files are
parseable. The separate `mvp:audit-summary -- --require-mvp-evidence` gate now
requires accepted role-bound host and viewer evidence. Smoke should use the
same evidence standard before declaring the automated MVP path ready.

## Goals / Non-Goals

**Goals:**

- Fail the smoke audit subcheck unless required host and viewer evidence is
  present in the expected local audit files.
- Continue summarizing only bounded counts and fixed booleans.
- Keep failure diagnostics at the existing `audit-not-ready` reason.
- Cover wrong-role, denied, failed, and missing disconnect evidence with tests.

**Non-Goals:**

- No production audit backend, remote log retrieval, or upload.
- No new audit record schema or raw timeline output.
- No new capture, input, relay, auth, browser, service, startup, privilege, or
  unattended behavior.

## Decisions

1. Add smoke-local required role evidence maps.
   - Rationale: smoke summary has a deliberately small, metadata-only parser.
     Keeping the gate local avoids exposing paths or importing CLI formatting
     concerns.
   - Alternative considered: shell out to `mvp:audit-summary`. Rejected because
     smoke should avoid extra child processes and raw command output handling.

2. Keep public smoke `auditSummary` shape stable while adding
   `disconnectObserved`.
   - Rationale: disconnect is already a smoke subcheck and part of strict MVP
     evidence. It remains a fixed boolean, not raw event data.

3. Reuse `audit-not-ready` for strict evidence failures.
   - Rationale: missing evidence should not reveal which side, action, path, or
     record was absent.

## Risks / Trade-offs

- Stricter smoke may fail runs that previously passed with partial audit logs.
  Mitigation: the smoke workflow already configures both local audit logs and
  disconnect checks; partial logs should not be treated as MVP-ready.
- Maintaining a second audit evidence map can drift from `mvp:audit-summary`.
  Mitigation: tests cover the same role-bound evidence semantics and this map
  is restricted to fixed smoke metadata.
