## 1. Helper Hardening

- [x] 1.1 Add visited-object tracking to the shared protocol `deepFreeze()` helper.
- [x] 1.2 Preserve existing return identity, output shape, primitive handling, null handling, already-frozen handling, array handling, and nested object handling.

## 2. Tests

- [x] 2.1 Add focused immutable snapshot tests for repeated references.
- [x] 2.2 Add focused immutable snapshot tests for cyclic references.
- [x] 2.3 Run focused immutable snapshot tests.

## 3. Verification

- [x] 3.1 Review the helper hardening for consent boundary, authorization, pairing, relay routing, host visibility, audit evidence, and abuse-resistance impact.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Archive the OpenSpec change after implementation is verified.
