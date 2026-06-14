## Context

The host runtime has several pre-send checks for delayed and direct lifecycle behavior. Those checks return before sending protocol messages when the lifecycle action is no longer valid. Examples include:

- revoke after terminal authorization, missing permission, or expiration;
- pause after terminal authorization, already-paused state, or expiration;
- resume after terminal authorization, not-paused state, or expiration;
- terminate after terminal authorization, expiration, or missing active/paused visible state;
- expiration or disconnect after terminal authorization;
- disconnect after expiration or missing active visible state;
- resume delay configured without a pause delay.

The checks are safety behavior. The log lines are optional observability. A logger failure must not alter whether the lifecycle action remains skipped.

## Goals / Non-Goals

**Goals:**

- Contain diagnostic logger failures for host lifecycle skip paths.
- Preserve existing lifecycle eligibility checks and successful lifecycle action behavior.
- Preserve mandatory audit persistence failure behavior for lifecycle actions that would send messages.
- Add focused regression coverage that logger failure is secret-safe and non-authorizing.

**Non-Goals:**

- No change to authorization state machines, grant narrowing, lifecycle timing, relay behavior, status snapshots, or protocol schemas.
- No change to audit sink failure semantics for lifecycle sends.
- No new audit event, persistent queue, external dependency, native UI, capture, input, clipboard, file-transfer, diagnostics collection, installer, service, startup persistence, or privilege-elevation behavior.
- No exposure of raw logger error text, tokens, pairing codes, protocol payloads, display names, credentials, private reasons, or remote content.

## Decisions

- Route lifecycle skip log lines through the existing best-effort runtime log helper.
  - Rationale: all targeted branches have already decided not to send a lifecycle action. Optional logging must not create a runtime error or change protocol behavior.
  - Alternative considered: keep direct logger calls for lifecycle skip visibility. Rejected because visibility diagnostics are less important than preserving deterministic fail-closed skip behavior.

- Keep audit-gated lifecycle sends unchanged.
  - Rationale: audit persistence is security-relevant evidence for actual lifecycle actions; this change only affects declined/no-op diagnostics.

## Risks / Trade-offs

- [Risk] If the diagnostic logger fails, operators may miss why a lifecycle action was skipped.
  - Mitigation: working loggers still receive the same bounded skip messages, while ineligible lifecycle behavior remains fail-closed.

- [Risk] Over-broad containment could hide errors in successful lifecycle sends.
  - Mitigation: the change is limited to skip diagnostics before sending; send/audit paths remain strict.
