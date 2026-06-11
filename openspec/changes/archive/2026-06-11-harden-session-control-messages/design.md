## Context

`session-control` messages are used by the development shell to express host pause, resume, and termination intent. The schema also includes `revoke-permission`, but it currently allows the permission field to be absent for revocation and present for unrelated control actions.

## Goals / Non-Goals

**Goals:**

- Make `session-control` message shape unambiguous for each action.
- Require `permission` only when the action is `revoke-permission`.
- Reject `permission` on pause, resume, and terminate actions.
- Reject blank reasons when a reason is present.

**Non-Goals:**

- No new remote action capability.
- No changes to screen capture, input, clipboard, file transfer, installer, service, startup, privilege, or native Windows behavior.
- No replacement of `permission-revoked` messages; this only hardens the control-intent message shape.

## Decisions

- Add a `superRefine` to `SessionControlMessageSchema`. This keeps inbound parsing and outbound encoding consistent with the rest of protocol schema hardening.
- Keep `reason` optional because some control events may not need explanatory text, but reject whitespace-only values when a reason is supplied.
- Preserve existing agent-shell pause, resume, and terminate messages because they do not carry permission fields and already send non-blank default reasons.

## Risks / Trade-offs

- Future callers that used permissive `session-control` shapes will fail validation. Mitigation: the stricter shape is safer and documented through protocol tests.
- `revoke-permission` remains an intent message, not the authoritative permission revocation event. Mitigation: existing `permission-revoked` and authorization state updates remain required for actual revocation workflows.
