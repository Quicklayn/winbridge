## 1. Specification

- [x] 1.1 Validate the OpenSpec change artifacts in strict mode.

## 2. Implementation

- [x] 2.1 Add shared protocol authorization reason validation for secret-bearing metadata.
- [x] 2.2 Add agent-shell CLI and direct runtime workflow reason validation for secret-bearing metadata.
- [x] 2.3 Update README and security model documentation for the lifecycle reason boundary.

## 3. Tests

- [x] 3.1 Add authorization state machine tests for secret-bearing and safe lifecycle reasons.
- [x] 3.2 Add protocol message tests for secret-bearing and safe authorization reasons.
- [x] 3.3 Add agent-shell args/runtime tests for secret-bearing and safe workflow reasons.
- [x] 3.4 Perform a focused security review of the diff for consent, visibility, revocation, audit, and secret exposure invariants.

## 4. Verification

- [x] 4.1 Run focused tests for protocol authorization/messages and agent-shell reason validation.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.3 Archive the completed OpenSpec change and rerun strict OpenSpec validation.
