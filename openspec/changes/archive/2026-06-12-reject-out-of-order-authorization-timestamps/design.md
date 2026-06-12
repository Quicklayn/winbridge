## Context

The authorization state machine emits consistent timestamps, but `SessionAuthorizationSchema` also parses external records. Direct parsing currently accepts records where `updatedAt` predates `createdAt`, `expiresAt` predates creation, or lifecycle timestamps sit outside the record's `createdAt` to `updatedAt` window.

Those records are not trustworthy audit metadata. Future native adapters will rely on this shared schema before evaluating sensitive remote actions, so malformed chronology should fail closed at the protocol boundary.

## Goals / Non-Goals

**Goals:**
- Enforce `updatedAt >= createdAt`.
- Enforce `expiresAt > createdAt`.
- Enforce all present lifecycle timestamps are `>= createdAt` and `<= updatedAt`.
- Keep state machine factories and transitions passing without behavior changes.
- Add focused schema tests.

**Non-Goals:**
- No ordering rules between every pair of lifecycle timestamps.
- No changes to terminal-state preservation after later expiration checks.
- No clock synchronization, distributed ordering, or monotonic counter design.
- No production audit store or identity/RBAC implementation.
- No capture, input, clipboard, file transfer, diagnostics export, services, startup persistence, privilege elevation, unattended access, or Windows security prompt handling.

## Decisions

1. Validate the record window first.
   - `createdAt` is the lower bound.
   - `updatedAt` is the upper bound for lifecycle timestamps.
   - `expiresAt` must be after creation because zero/negative TTL authorization windows are invalid.

2. Do not require lifecycle timestamps to equal `updatedAt`.
   - Rationale: records may preserve earlier lifecycle timestamps as audit history while later updates occur.

3. Do not add full pairwise lifecycle ordering in this increment.
   - Rationale: ordering every historical transition needs a broader design for terminal records and pause/resume cycles. The current increment rejects clearly impossible records without overfitting future semantics.

## Risks / Trade-offs

- Fixtures with impossible chronology will fail earlier. That is intended because they are not reliable authorization evidence.
- This does not address clock skew between machines. Current records are local development schema data, and production distributed ordering remains future work.

## Migration Plan

1. Add timestamp comparison helpers in `authorization.ts`.
2. Validate record-level and lifecycle timestamp bounds in `SessionAuthorizationSchema.superRefine`.
3. Add focused tests for invalid record window and lifecycle timestamps outside the window.
4. Update docs and OpenSpec specs.
5. Run focused tests plus full check, test, build, and OpenSpec validation.

Rollback is removing the ordering helper and tests, though that would reopen impossible audit chronology.

## Open Questions

- Future production authorization may need server-issued monotonic sequence numbers or signed audit chains.
