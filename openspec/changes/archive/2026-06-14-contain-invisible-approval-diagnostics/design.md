## Context

When `sendAuthorizationApproval` handles a host approval with `visibleToHost=false`, the runtime has already prepared and sent the approval decision and approval audit event, then intentionally returns before active visible state, host indicator activation, active audit, lifecycle timers, signal authorization, capture, or input. A direct diagnostic logger call in that return branch can throw and cause `handleMessage` to report a runtime error.

## Goals / Non-Goals

**Goals:**

- Make the invisible-approval withheld-active diagnostic log best-effort.
- Preserve the ordering where approval decision and approval audit are sent before the withheld-active diagnostic.
- Preserve no active state, no host indicator, no signal authorization, no capture, and no input when visible session state is false.
- Cover both runtime error containment and secret-safe logger text behavior.

**Non-Goals:**

- Do not change host approval/denial decisions, host consent provider behavior, grant scope resolution, audit persistence failure handling, active visible authorization, lifecycle timers, signal authorization, relay behavior, or public send authority checks.
- Do not catch or suppress failures from required audit persistence or event callbacks.
- Do not add native capture, input, installer, service, startup persistence, privilege elevation, stealth, or bypass behavior.

## Decisions

- Route only the invisible-approval diagnostic log through `logRuntimeMessageBestEffort`.
  - Rationale: logging must not convert the existing invisible-session safety return into a runtime error.
  - Alternative considered: wrap the full approval path. Rejected because audit persistence, protocol sends, and authorization state transitions should keep their current failure behavior.

- Test the static host approval path with `visibleToHost=false`.
  - Rationale: it directly exercises the target log line and verifies the already-approved but non-active local status stays unchanged.

## Risks / Trade-offs

- [Risk] A broken logger may miss the explanatory withheld-active line. -> Mitigation: approval decision/audit and local status remain the authoritative evidence, and working loggers retain the same message.
- [Risk] Containment could be mistaken for allowing invisible sessions. -> Mitigation: tests assert no active state, no host indicator, no signal send, and inactive host status with `visibleToHost=false`.

## Migration Plan

No migration is required. Runtime API, protocol schema, and CLI options are unchanged.

## Open Questions

None.
