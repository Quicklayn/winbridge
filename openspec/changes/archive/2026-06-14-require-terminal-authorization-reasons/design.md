## Context

The protocol layer rejects terminal `session-authorization-state` messages without a reason, and state-machine transition helpers already produce terminal reasons through required inputs or safe defaults. The shared authorization record schema still accepts direct parsed `denied`, `revoked`, `terminated`, or `expired` records when `reason` is omitted.

That weakens audit evidence for fail-closed lifecycle records. Future adapters and audit consumers should not treat terminal authorization records as trusted lifecycle evidence unless the reason field is present and has already passed the existing canonical reason validation.

## Goals / Non-Goals

**Goals:**

- Reject parsed terminal authorization records without `reason`.
- Reuse the existing `AuthorizationReasonSchema` for non-blank, trimmed, bounded, format-safe, and secret-safe validation.
- Preserve transition helpers that already write reasons for denial, revocation, termination, and expiration.
- Preserve non-terminal records that do not require a reason.

**Non-Goals:**

- Do not change protocol message schemas; terminal state messages already require reasons.
- Do not change permission grants, visibility activation, capture, input, relay routing, installer, startup, service, token, log persistence, or privilege behavior.
- Do not introduce new reason text sources or expose raw private reasons in diagnostics.

## Decisions

- Add schema-level terminal reason validation in `SessionAuthorizationSchema`.
  - Rationale: schema parsing is the common boundary before action authorization and before future adapters consume authorization state.
  - Alternative considered: rely on protocol message validation only. That misses direct record parsing and internal callers that use `SessionAuthorizationSchema`.

- Keep `reason` optional for pending, approved, active, and paused records.
  - Rationale: those states can be valid without fail-closed lifecycle reason metadata. Pause/resume helpers still record default reasons when transitions carry them.
  - Alternative considered: require reasons on all statuses. That would reject valid pending, approved, and active authorization records.

## Risks / Trade-offs

- Direct tests or tools that synthesize terminal records without reasons will fail validation. -> This is intended because such records are incomplete lifecycle evidence.
- Error messages identify only the missing `reason` field and status. -> That keeps diagnostics bounded and avoids exposing private reason text.
