# Design: Cycle-safe protocol deepFreeze

## Overview
The shared protocol immutable snapshot helper should remain a small recursive freezer, but it should avoid revisiting object references. A `WeakSet<object>` is sufficient because the helper only needs to track object identity during a single traversal and must not retain objects after freezing.

## Approach
- Add an optional internal `visited` `WeakSet<object>` parameter to `deepFreeze()`.
- Return primitives, `null`, already visited objects, and already frozen objects unchanged.
- Add each object to `visited` before walking nested values so self-referential graphs do not recurse forever.
- Continue using `Object.values()` to preserve existing behavior for arrays and plain objects.
- Keep the public function name, return type, and runtime output shapes unchanged.

## Security Rationale
Immutable snapshots protect identity, authorization, audit, pairing, and protocol evidence from in-place caller mutation. Cycle-safe traversal prevents helper-level recursion failure from weakening that invariant for local object graphs while preserving all consent, authorization, host visibility, and audit boundaries.

## Compatibility
Existing callers keep the same API and returned object identity. JSON-compatible protocol outputs remain unchanged. Repeated object references remain shared references; they are simply frozen once.

## Alternatives Considered
- Reject cyclic inputs: rejected because `deepFreeze()` is a helper, not a validator, and callers already rely on schema validation separately.
- Clone before freezing: rejected because it would change object identity and introduce unnecessary serialization semantics into the helper.
