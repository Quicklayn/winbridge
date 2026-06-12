## Context

`packages/protocol/src/authorization.ts` has strict invariants for the session authorization lifecycle: grant-bearing records require non-empty permissions, duplicate permissions are rejected, and terminal states carry no permissions. `packages/protocol/src/session.ts` still exposes a simpler `SessionGrantSchema` used by legacy authorization checks and tests.

That legacy grant schema requires host approval and visible-session literals, but it only bounds the permission list to at most 16 entries. It should also reject empty and duplicate grant scopes so every grant-bearing record is explicit and unambiguous at parse time.

## Goals / Non-Goals

**Goals:**
- Reject empty `SessionGrantSchema.permissions`.
- Reject duplicate `SessionGrantSchema.permissions`.
- Keep existing permission enum, max scope size, expiration check, host approval literal, and visible-session literal behavior.
- Add focused tests around `assertConsentBoundGrant`.

**Non-Goals:**
- No new permission types.
- No changes to lifecycle state machine transitions.
- No production identity or RBAC implementation.
- No capture, input, clipboard, file transfer, diagnostics export, services, startup persistence, privilege elevation, unattended access, or Windows security prompt handling.

## Decisions

1. Enforce grant scope at schema parse time.
   - Rationale: `assertConsentBoundGrant` already parses the schema before checking expiration, so schema-level invariants protect all callers.

2. Keep exact permission values and existing max size.
   - Rationale: permission canonicalization is already provided by the enum; the change is only about empty and repeated scope entries.

3. Add tests to the existing session grant test group.
   - Rationale: current coverage for `assertConsentBoundGrant` lives beside protocol envelope tests, and this keeps the change scoped.

## Risks / Trade-offs

- Any caller constructing an empty grant will fail earlier. That is intended because empty grant-bearing records are not useful authorization metadata.
- Duplicate permissions were previously harmless for `includes()` checks but ambiguous for audit and UI summaries. Rejecting them aligns legacy grants with the newer authorization state machine.

## Migration Plan

1. Add a shared grant permission-list schema or super refinement in `session.ts`.
2. Add tests for empty and duplicate grants.
3. Update security docs and specs.
4. Run focused tests plus full check, test, build, and OpenSpec validation.

Rollback is restoring the previous permission array schema, though that would reopen ambiguous grant metadata.

## Open Questions

- Future production authorization should replace legacy session grants with durable account, device, and RBAC-aware records.
