## Context

The agent shell accepts positive integer authorization TTL values starting at `1` millisecond for development lifecycle simulation. Host approval currently computes `expiresAt` once, then creates each protocol envelope separately. With very short TTLs, the generated approval or active-state envelope can have a `createdAt` timestamp at or after `expiresAt`, causing shared protocol validation to reject the grant before expiration simulation is scheduled.

## Goals / Non-Goals

**Goals:**

- Keep generated approval and active-state messages internally consistent for any valid authorization TTL.
- Schedule expiration from the authorization `expiresAt` boundary so expiry still wins over delayed revoke, terminate, pause, and resume flows when the boundary has already passed.
- Preserve fail-closed authorization behavior and existing protocol validation.

**Non-Goals:**

- No change to runtime option validation ranges.
- No change to permission scope, visibility requirements, capture, input, relay routing, installer, service, token, log storage, or privilege behavior.
- No production clock synchronization mechanism.

## Decisions

1. Create a single grant timestamp for host approval.
   - Rationale: approval and active-state messages describe the same authorization grant and should share a coherent `createdAt` to keep `expiresAt` after creation even for short TTLs.
   - Alternative considered: relax protocol validation for short TTL grants. Rejected because protocol should keep rejecting already-stale grants from arbitrary producers.

2. Schedule expiration against `expiresAt`.
   - Rationale: expiration should represent the grant boundary, not the later time when workflow timers happen to be scheduled.
   - Alternative considered: keep using the raw TTL delay. Rejected because message emission work before timer scheduling can shift short-TTL behavior past the actual boundary.

3. Keep lifecycle send guards unchanged.
   - Rationale: delayed revoke, terminate, pause, and resume already check terminal state and expiration before sending; the fix should make the expiration event reliable without adding new grants.

## Risks / Trade-offs

- Very short TTLs can still expire before the viewer receives the active state. Mitigation: viewer-side authorization checks already fail closed when `expiresAt` is in the past.
- Shared grant `createdAt` may be slightly earlier than socket write time. Mitigation: the timestamp represents the host grant decision boundary and is only used to keep protocol metadata coherent; runtime authorization still depends on `expiresAt`.
