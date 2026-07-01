## Context

`mvp:audit-summary -- --require-mvp-evidence` currently checks whether all
required evidence flags appear somewhere across the host and viewer summaries.
The summaries themselves are already role-scoped, so the strict gate can use
that existing structure without changing audit records or exposing new output.

## Goals / Non-Goals

**Goals:**
- Make the strict post-run MVP gate role-bound.
- Continue counting only accepted audit outcomes as evidence.
- Keep the public coverage output and JSON result shape stable.
- Fail closed with the existing fixed `missing-required-evidence` reason.
- Avoid printing missing role/flag names in failure output.

**Non-Goals:**
- No production audit backend, remote log retrieval, or upload.
- No new audit record schema or raw event timeline.
- No live runtime, network, capture, input, browser, service, startup,
  privilege, unattended, or Windows prompt behavior.

## Decisions

1. Use a private required-role map:
   - Host: authorization approval, active authorization, screen frame sent,
     permission revoked, and disconnect observed.
   - Viewer: screen frame output, input sent, and disconnect observed.

2. Keep `coverage` as a union for human-readable summary continuity. The strict
   gate checks `roles.host` and `roles.viewer` directly.

3. Reuse `missing-required-evidence` for any missing role-bound evidence so
   failure output remains bounded and does not reveal paths, record contents, or
   run details.

## Risks / Trade-offs

- Some future valid workflow may move an evidence action between roles. That
  should be a deliberate OpenSpec change rather than silently accepted by the
  MVP gate.
- Requiring disconnect evidence from both roles may fail runs where one side
  did not persist a shutdown record. The generated MVP workflow already
  configures both local audit logs and viewer disconnect behavior, so this is
  acceptable for a strict post-run pass gate.
