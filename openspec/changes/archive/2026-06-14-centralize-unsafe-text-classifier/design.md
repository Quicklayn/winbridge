## Context

The protocol package currently duplicates text-control detection helpers in `audit.ts`, `authorization.ts`, `identity.ts`, and `messages.ts`. Each copy checks for ASCII control characters and a fixed set of Unicode bidirectional or zero-width formatting controls. The semantics are intentionally the same across audit metadata, authorization reasons, device display names, protocol reasons/actions/capabilities, and JSON detail keys.

This change is security-sensitive because these checks bound auth/log/protocol metadata, but it does not change permission vocabulary, authorization lifecycle, redaction rules, relay behavior, capture, input, native Windows behavior, installer behavior, startup persistence, services, token issuance, or privilege elevation.

## Goals / Non-Goals

**Goals:**

- Move text-control detection to a leaf protocol helper module.
- Preserve current unsafe character sets and schema error messages.
- Avoid import cycles by keeping the helper module independent from audit, messages, authorization, identity, and session.
- Add tests that compare representative schema paths against the shared helper.

**Non-Goals:**

- Do not broaden or narrow which text values are rejected.
- Do not change protocol object shapes, audit redaction, permission parsing, authorization lifecycle, relay runtime behavior, CLI parsing, or app-level runtime config validation.
- Do not expose new remote assistance capabilities or hidden behavior.

## Decisions

1. Add `packages/protocol/src/text-safety.ts` as a leaf module.

   Rationale: `audit.ts`, `authorization.ts`, `identity.ts`, and `messages.ts` can all import it without depending on each other. This mirrors the identifier metadata helper pattern and avoids cycles.

   Alternative considered: keep the helper in `audit.ts`. That was rejected because identity and authorization already import audit for sensitive metadata checks, and adding more validation ownership there would keep audit as a utility catch-all.

2. Keep the helper generic and message-free.

   Rationale: callers should continue to own field-specific schema messages such as "Audit action must not contain..." or "Display name must not contain...". The helper only classifies text.

   Alternative considered: export Zod refinements with fixed messages. That would reduce code further but would force one diagnostic shape across distinct protocol fields.

3. Limit implementation to `packages/protocol`.

   Rationale: app-level relay/runtime argument validators have different package boundaries and operational messages. Keeping this change in the protocol package avoids mixing schema refactor with runtime configuration behavior.

## Risks / Trade-offs

- Import-cycle risk -> keep `text-safety.ts` dependency-free.
- Behavior drift during refactor -> keep the exact same code point set and run focused tests for audit, messages, authorization, and identity paths.
- Public API ambiguity -> do not add the helper to the package barrel unless a future consumer needs it; internal imports can use the module path.
- Test gaps -> rely on existing field-specific tests plus a focused shared-helper regression test.

## Migration Plan

1. Add the leaf helper module.
2. Replace local duplicated text-control helper functions in protocol modules.
3. Add focused shared-helper regression coverage.
4. Run focused protocol tests and protocol typecheck.
5. Run full repository checks and archive the OpenSpec change.
