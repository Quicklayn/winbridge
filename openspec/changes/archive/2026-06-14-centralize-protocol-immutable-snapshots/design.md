## Context

The protocol package currently defines equivalent `deepFreeze` helpers in `audit.ts`, `authorization.ts`, `identity.ts`, `messages.ts`, and `session.ts`. These helpers recursively freeze returned objects after schema validation so callers cannot mutate trusted audit evidence, authorization state, pairing records, protocol envelopes, or session grants in place.

This change is security-sensitive because immutable snapshots support consent, audit, and authorization invariants. It is a refactor only and does not change permissions, lifecycle transitions, redaction rules, relay behavior, capture, input, native Windows behavior, installer behavior, startup persistence, services, token issuance, or privilege elevation.

## Goals / Non-Goals

**Goals:**

- Move recursive freeze behavior into a dependency-free protocol helper module.
- Preserve current behavior for arrays, nested objects, primitives, null, and already-frozen values.
- Avoid import cycles by keeping the helper module independent from all protocol domain modules.
- Add focused tests for the helper and representative protocol snapshot paths.

**Non-Goals:**

- Do not change object shapes, validation rules, redaction rules, permission parsing, authorization lifecycle, or public package exports.
- Do not introduce runtime persistence, services, startup behavior, relay routing changes, capture, input, or native Windows capabilities.

## Decisions

1. Add `packages/protocol/src/immutable-snapshot.ts` as a leaf module.

   Rationale: all protocol modules can import a dependency-free helper without depending on each other. This keeps immutability enforcement centralized and avoids cycles.

   Alternative considered: keep one helper in `audit.ts` and import it elsewhere. That was rejected because audit already depends on session schemas, and using audit as a general utility owner would create fragile dependency direction.

2. Keep the helper generic and internal.

   Rationale: the protocol package only needs shared implementation, not a new public API. Domain modules should continue to own their exported factories and validation functions.

   Alternative considered: export the helper from `index.ts`. That would make it harder to change internals later and is not needed by current consumers.

3. Preserve current recursive Object.freeze semantics.

   Rationale: this is a maintainability refactor. Changing how dates, maps, sets, or class instances behave would be a separate behavior change and would need broader requirements.

## Risks / Trade-offs

- Import-cycle risk -> keep `immutable-snapshot.ts` dependency-free.
- Behavior drift -> copy the existing recursive algorithm exactly and run existing immutable tests plus focused helper tests.
- Public API ambiguity -> do not add the helper to the package barrel.
- False confidence -> verify representative snapshot paths in audit, messages, authorization, identity, and session grant code.

## Migration Plan

1. Add the leaf helper module.
2. Replace duplicated `deepFreeze` implementations in protocol domain modules.
3. Add focused immutable snapshot regression tests.
4. Run focused protocol tests and protocol typecheck.
5. Run full repository checks and archive the OpenSpec change.
