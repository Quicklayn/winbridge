## Context

The development protocol uses `hello` messages as presence metadata. Display names are now validated as non-blank, but capability hints remain only `min(1).max(80)` strings and can still be whitespace-only or duplicated.

Capabilities are not authorization grants, yet ambiguous values can make diagnostics and future UI decisions harder to reason about. Rejecting blank and duplicate capability hints keeps presence metadata deterministic without changing any remote action behavior.

## Goals / Non-Goals

**Goals:**
- Reject empty or whitespace-only hello capability hints.
- Reject duplicate hello capability hints.
- Preserve the current 80-character per-entry and 32-entry array limits.
- Keep capabilities as exact strings without trimming or normalization.

**Non-Goals:**
- No capability negotiation semantics.
- No remote action permission grants.
- No production account, device trust, or authorization changes.
- No capture, input, clipboard, file transfer, diagnostics export, services, startup persistence, privilege elevation, unattended access, or Windows security prompt handling.

## Decisions

1. Add a protocol-local `ProtocolCapabilitySchema`.
   - Rationale: capability hints are message metadata, not device identity, so they belong in message schema validation.

2. Reject duplicates with a schema refinement on `HelloMessageSchema`.
   - Rationale: duplicate hints add no capability and make peer summaries ambiguous. Exact-string uniqueness matches the current no-normalization approach.

3. Preserve values exactly.
   - Rationale: protocol validation should reject invalid metadata without silently changing what a peer sent.

## Risks / Trade-offs

- Exact-string uniqueness means differently cased capability names are still distinct. That is acceptable until a future capability registry or negotiation spec defines canonical casing.
- Existing callers sending blank or duplicate capabilities will fail. This is intended because those values are ambiguous metadata.

## Migration Plan

1. Add the capability schema and duplicate check.
2. Add focused tests for blank and duplicate capabilities.
3. Update docs and OpenSpec.
4. Run focused tests plus full check, test, build, and OpenSpec validation.

Rollback is restoring the previous capability array schema, though that would reopen the ambiguous metadata path.

## Open Questions

- A future capability registry may define canonical names, versioning, and compatibility negotiation.
