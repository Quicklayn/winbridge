## Context

The agent shell already sends secret-safe development `audit-event` messages for host authorization decisions. Viewer request reasons are now host-visible consent context, but raw reason text remains intentionally redacted from local events and audit metadata. The current audit detail records permission counts and host-authored reason configuration, but it does not record whether a viewer request reason was present when the host decided.

## Goals / Non-Goals

**Goals:**

- Add a boolean `requestReasonProvided` detail field to host approval and denial audit events.
- Derive the boolean from the validated inbound `session-authorization-request.reason` presence.
- Keep raw request reason text out of protocol audit details, local audit sink records, runtime events, logs, and status output.
- Preserve existing consent, visible activation, grant, denial, revocation, pause, termination, disconnect, and fail-closed gates.

**Non-Goals:**

- No raw request reason persistence.
- No protocol schema changes.
- No production identity or authorization changes.
- No capture, input, clipboard, file-transfer, diagnostics, relay routing, installer, service, startup, persistence, privilege elevation, hidden-session, or Windows prompt-bypass behavior.

## Decisions

- Store only a boolean presence flag.
  - Rationale: audit consumers can see whether the host had viewer-provided context without storing potentially sensitive free text.
  - Alternative considered: store the raw or hashed reason. Rejected because current reason-handling policy is redaction-first and a hash would still create unnecessary correlatable metadata.
- Add the field to both approval and denial audit details.
  - Rationale: both outcomes are host authorization decisions and should have comparable audit context.
  - Alternative considered: add it only to approvals. Rejected because denied decisions also matter for accountability and abuse review.
- Reuse the existing audit event construction path.
  - Rationale: local audit sink persistence and protocol `audit-event` emission already share the same detail object, so one scoped change covers both outputs consistently.

## Risks / Trade-offs

- [Risk] Consumers could treat `requestReasonProvided=true` as proof that the reason was truthful.
  - Mitigation: the field name records presence only; docs/specs keep raw reason truth and production identity out of scope.
- [Risk] Expanding audit detail can accidentally expose raw request text.
  - Mitigation: implementation adds only `Boolean(request.reason)` and tests assert raw reason text is absent from audit events, local audit records, and runtime events.
