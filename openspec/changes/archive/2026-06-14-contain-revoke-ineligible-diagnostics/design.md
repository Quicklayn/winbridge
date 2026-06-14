## Context

The host runtime schedules delayed permission revocation only after active visible authorization is prepared. Before scheduling, it checks whether a revoke permission was configured and whether that permission is included in the narrowed active grant.

If either check fails, the runtime returns without sending `session-control`, `permission-revoked`, revoked authorization state, or revoke audit messages. The current implementation also writes a bounded diagnostic log line directly. That log line is observability only; it is not consent evidence and is not required for safe no-op behavior.

## Goals / Non-Goals

**Goals:**

- Contain diagnostic logger failures for scheduled revoke ineligible paths.
- Preserve the existing active authorization, visible host indicator, active audit, and no-op revoke semantics.
- Preserve bounded diagnostic text when the logger works.
- Add regression coverage that logger failure is secret-safe and non-authorizing.

**Non-Goals:**

- No change to host consent decisions, grant narrowing, permission revoke eligibility, authorization TTL, relay behavior, or status snapshots.
- No change to successful delayed revoke behavior.
- No new audit event, persistent queue, external dependency, native UI, capture, input, clipboard, file-transfer, diagnostics collection, installer, service, startup persistence, or privilege-elevation behavior.
- No exposure of raw logger error text, tokens, pairing codes, protocol payloads, display names, credentials, private reasons, or remote content.

## Decisions

- Route only the two scheduled revoke ineligible diagnostic logger calls through the existing best-effort runtime log helper.
  - Rationale: the revoke is already declined before any revoke workflow is scheduled; the logger must not alter that safety outcome.
  - Alternative considered: remove the diagnostics. Rejected because the bounded log lines are useful during local development and remain safe when the logger works.

- Keep successful delayed revoke scheduling unchanged.
  - Rationale: this change only affects observability for ineligible no-op branches, not authorized revocation semantics.

## Risks / Trade-offs

- [Risk] If the diagnostic logger fails, operators may miss why the scheduled revoke was not armed.
  - Mitigation: the runtime still preserves the safe no-op behavior, and working loggers receive the same bounded message.

- [Risk] Over-broad containment could hide bugs in the actual revoke workflow.
  - Mitigation: containment is limited to pre-scheduling ineligible diagnostics; the delayed revoke workflow and control/audit sends remain unchanged.
