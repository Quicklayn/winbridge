## Context

WinBridge is still a protocol and relay foundation. Pairing tickets establish a short-lived relationship prerequisite, but they deliberately do not grant remote access. Future screen capture and input adapters need a reusable authorization contract now, before they exist.

## Goals / Non-Goals

**Goals:**

- Model session lifecycle states: pending, denied, approved, active, revoked, terminated, expired.
- Require explicit host consent before approval.
- Require visible host session state before activation.
- Enforce scoped permissions and expiration for remote action checks.
- Make revocation and termination fail closed.

**Non-Goals:**

- No native Windows UI.
- No capture/input implementation.
- No production account authorization service.
- No durable state store.
- No reconnect semantics beyond state modeling.

## Decisions

1. **Keep state machine in `packages/protocol`.**
   - Rationale: Host, viewer, relay, and future native adapters all need the same authorization semantics.
   - Alternative considered: Put state only in relay. That would leave endpoint enforcement underspecified.

2. **Activation requires both host approval and visible host session flag.**
   - Rationale: Remote assistance must remain visible to the host for the entire active session.
   - Alternative considered: Allow approval to imply active. That would make it easier to accidentally bypass the visible-session requirement.

3. **Authorization checks consume state plus requested permission.**
   - Rationale: Future adapters can use one helper to deny expired, revoked, inactive, invisible, or ungranted actions.
   - Alternative considered: Let each adapter implement checks independently. That would invite drift.

## Risks / Trade-offs

- **Risk: In-memory protocol state is not durable.** -> Mitigation: This change is a contract and test foundation; durable session storage remains future work.
- **Risk: Future components bypass helpers.** -> Mitigation: OpenSpec and review gates require use of shared authorization checks for sensitive actions.
- **Risk: State names become too rigid.** -> Mitigation: Keep transition helpers small and explicit.

## Migration Plan

1. Add session authorization schemas and helpers.
2. Add tests for denial, activation, revocation, termination, expiration, and permission scope.
3. Update docs and OpenSpec.
4. Run verification, archive, commit, and push.
