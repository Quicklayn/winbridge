## Context

The host runtime emits a local indicator event for active, paused, and inactive visible-session states. Immediately after updating `sessionState.hostIndicator` and calling `onEvent`, the runtime writes a bounded diagnostic log line through the configured logger.

That logger call is not authoritative consent evidence. The indicator event, authorization state, and audit/event messages are the meaningful workflow artifacts. If a logger throws after the indicator event, the active visible workflow can stop before the viewer receives active state and before the active workflow audit event is emitted.

## Goals / Non-Goals

**Goals:**

- Contain host indicator diagnostic logger failures.
- Preserve host indicator event emission and bounded indicator log text when the logger works.
- Preserve mandatory workflow audit behavior for visible approval and lifecycle actions.
- Add regression coverage that logger failure is secret-safe and non-authorizing.

**Non-Goals:**

- No change to host consent decision, permission grant resolution, authorization TTL, lifecycle state transitions, relay behavior, or status snapshots.
- No change to indicator event callback semantics. A future UI adapter may choose fail-closed behavior for failed visible indicator rendering.
- No new audit event, persistent queue, external dependency, or production UI.
- No exposure of raw logger error text, tokens, pairing codes, protocol payloads, display names, credentials, private reasons, or remote content.

## Decisions

- Route only the indicator diagnostic logger call through the existing best-effort runtime log helper.
  - Rationale: the logger call is observability; it must not be able to interrupt active-state or audit emission after the local visibility event is emitted.
  - Alternative considered: wrap the whole indicator emission in best-effort handling. That was rejected because the indicator event itself is part of the host visibility contract and should remain an explicit workflow boundary.

- Keep active audit preparation before indicator emission and active state/audit sending after indicator emission.
  - Rationale: this preserves the current fail-closed audit gate while removing only the logger as a failure source.

## Risks / Trade-offs

- [Risk] If the diagnostic logger fails, operators may miss the local indicator log line.
  - Mitigation: the indicator event and workflow messages remain authoritative; working loggers still receive the exact same bounded text.

- [Risk] Over-broad containment could hide indicator rendering failures.
  - Mitigation: this change does not catch `onEvent` failures. It only catches the diagnostic logger call that follows event emission.
