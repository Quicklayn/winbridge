## Context

`packages/protocol/src/authorization.ts` owns the consent-bound session authorization lifecycle used by the agent shell and future Windows clients. The state machine already validates lifecycle, visibility, permission scope, expiration, reason text, and terminal fail-closed behavior, but its returned objects are ordinary mutable JavaScript values.

Because these records carry safety-critical authorization state, callers should treat them as snapshots. Runtime immutability makes that contract enforceable before native capture/input adapters are introduced.

## Goals / Non-Goals

**Goals:**

- Freeze every authorization record returned by exported state-machine operations.
- Freeze nested authorization data, especially `permissions`, so grant scope cannot be widened in place.
- Keep schema validation behavior and wire-compatible JSON shape unchanged.
- Add focused tests for mutation attempts against lifecycle state, host visibility, and permission scope.

**Non-Goals:**

- No new authorization states, permissions, protocol messages, relay behavior, capture, input, clipboard, file transfer, diagnostics, installer, service, startup, persistence, credential, keylogging, evasion, or Windows prompt behavior.
- No TypeScript type-level readonly migration across the workspace in this change.

## Decisions

1. Freeze after schema parsing.

   The authoritative validation point is `SessionAuthorizationSchema.parse(...)`. Freezing only after successful parse keeps invalid records rejected exactly as before and ensures every exported constructor or transition returns a validated immutable snapshot.

2. Deep-freeze current object graph instead of only the top-level record.

   Freezing only the top-level object would still allow `authorization.permissions.push(...)`. A small local recursive freezer covers arrays and future nested plain data without introducing a dependency or changing serialized output.

3. Keep parsed input objects separate from returned snapshots.

   Existing transitions parse an input, compute a new object, and return a parsed output. The implementation will route returned records through a local helper. Internal checks may continue parsing mutable caller input because the exported contract is about outputs.

4. Preserve the current public data shape.

   Consumers still receive plain objects and arrays with the same fields. The only behavior change is that post-return mutation fails or has no effect.

## Risks / Trade-offs

- Existing callers that mutate returned authorization records will now fail at runtime -> This is intentional for safety-critical state. Tests and current repository search show no valid dependency on mutation.
- Recursive freeze adds minor overhead on authorization transitions -> Authorization transitions are not high-frequency data-plane operations, and the object graph is small.
- `Readonly` TypeScript types would make the contract clearer at compile time -> Deferred to avoid broad type churn; runtime enforcement gives the required safety behavior now.
