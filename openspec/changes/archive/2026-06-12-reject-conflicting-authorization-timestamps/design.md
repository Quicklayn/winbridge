## Context

`SessionAuthorizationSchema` already enforces many safety invariants: grant-bearing states carry permissions, terminal states do not, active/paused states are visible, and several states require their matching lifecycle timestamp. However, it does not reject timestamp fields that belong to impossible later lifecycle states.

For example, a `pending` record with `activatedAt` is not active, but the metadata suggests activation happened. A `denied` record with `approvedAt` or `terminatedAt` is also contradictory. These records should fail schema parsing before any remote action authorization or audit path can treat them as trustworthy.

## Goals / Non-Goals

**Goals:**
- Reject conflicting lifecycle timestamps on `pending`, `approved`, and `denied` authorization records.
- Keep legitimate historical timestamps for live and terminal records out of scope for this increment.
- Preserve existing state-machine transitions and all current fail-closed authorization checks.
- Add focused tests at schema parse boundaries.

**Non-Goals:**
- No timestamp ordering checks.
- No changes to active, paused, revoked, terminated, or expired history semantics.
- No production audit store or identity/RBAC implementation.
- No capture, input, clipboard, file transfer, diagnostics export, services, startup persistence, privilege elevation, unattended access, or Windows security prompt handling.

## Decisions

1. Scope this increment to `pending`, `approved`, and `denied`.
   - Rationale: those states have clear impossible timestamp sets. Active/paused/terminal records can legitimately retain earlier lifecycle timestamps as audit history and need a broader design if ordering is introduced.

2. Reject conflicts in `SessionAuthorizationSchema.superRefine`.
   - Rationale: all public factories and authorization checks already parse this schema, so schema-level validation protects direct external input.

3. Use explicit field-level issues.
   - Rationale: tests and future callers can identify exactly which timestamp field is contradictory.

## Risks / Trade-offs

- Existing external test fixtures with contradictory timestamps will fail. That is intended because those records are not reliable authorization metadata.
- This does not prove timestamp ordering. It only rejects state/timestamp combinations that are structurally impossible for pre-active and denied states.

## Migration Plan

1. Add helper validation for forbidden timestamp fields by status.
2. Add tests for pending, approved, and denied conflict cases.
3. Update security docs and OpenSpec specs.
4. Run focused tests plus full check, test, build, and OpenSpec validation.

Rollback is removing the forbidden timestamp validation and tests, though that would reopen contradictory lifecycle metadata.

## Open Questions

- Timestamp ordering and richer terminal history validation remain future OpenSpec work.
