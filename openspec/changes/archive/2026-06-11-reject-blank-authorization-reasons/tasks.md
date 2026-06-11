## 1. Authorization Reason Validation

- [x] 1.1 Reject blank authorization record reasons in `SessionAuthorizationSchema`.
- [x] 1.2 Reject blank required denial and termination reasons in authorization state-machine helpers.
- [x] 1.3 Reject blank optional revocation, pause, and resume reasons while preserving default reasons when omitted.

## 2. Protocol Reason Validation

- [x] 2.1 Reject blank reason fields in authorization request, decision, state, and permission-revoked protocol messages.
- [x] 2.2 Preserve valid protocol messages that omit optional reason fields.

## 3. Tests

- [x] 3.1 Add authorization state-machine tests for blank required and optional lifecycle reasons.
- [x] 3.2 Add direct authorization schema parse tests for blank reasons.
- [x] 3.3 Add protocol tests for blank authorization-related message reasons and omitted optional reasons.

## 4. Review And Verification

- [x] 4.1 Run security review for authorization reason validation.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.3 Archive the completed OpenSpec change and verify no active changes remain.
