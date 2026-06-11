## Context

The protocol package now has a deny-by-default session authorization state machine. The WebSocket relay can forward validated protocol envelopes, but the lifecycle messages themselves are still limited to older host consent request/decision schemas.

## Goals / Non-Goals

**Goals:**

- Add explicit lifecycle messages for authorization requests, decisions, state updates, and permission revokes.
- Keep message schemas aligned with `SessionAuthorizationSchema`.
- Make visible-session state explicit in active updates.
- Reject malformed permissions, statuses, actors, and missing expiration fields.

**Non-Goals:**

- No implementation of host UI.
- No automatic approval.
- No screen capture, input, clipboard, file transfer, or diagnostics.
- No production account authorization.

## Decisions

1. **Keep old consent messages for compatibility and add richer authorization messages.**
   - Rationale: Existing tests and shells can continue working while future UI uses the richer contracts.
   - Alternative considered: Replace old messages immediately. That creates churn without a host UI yet.

2. **State updates carry `visibleToHost`.**
   - Rationale: Active authorization is invalid without visible host state, and receivers need to inspect that signal.
   - Alternative considered: Infer visibility from status. That hides a safety-critical field.

3. **Permission revoke is its own message.**
   - Rationale: Revocation is a high-priority event and should be easy for clients to route and audit.
   - Alternative considered: Encode revocation only as generic session-control. That is less explicit.

## Risks / Trade-offs

- **Risk: Duplicate old and new consent message concepts.** -> Mitigation: Docs mark new authorization messages as preferred for future clients.
- **Risk: Messages are mistaken for authorization by themselves.** -> Mitigation: Specs and docs state receivers must still call the state-machine authorization helper.

## Migration Plan

1. Add message schemas and union entries.
2. Add protocol tests.
3. Update docs.
4. Run verification, archive, commit, and push.
