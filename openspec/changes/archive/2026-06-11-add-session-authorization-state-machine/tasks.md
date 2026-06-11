## 1. OpenSpec

- [x] 1.1 Add proposal, design, session-authorization spec, and tasks.
- [x] 1.2 Validate the OpenSpec change in strict mode.

## 2. Protocol State Machine

- [x] 2.1 Add session authorization schemas and lifecycle state types.
- [x] 2.2 Add helpers for request, approve, deny, activate, revoke permission, terminate, and expire checks.
- [x] 2.3 Add deny-by-default remote action authorization helper.

## 3. Tests

- [x] 3.1 Test pending and denied states do not authorize actions.
- [x] 3.2 Test activation requires visible host session state.
- [x] 3.3 Test scoped permissions, permission revocation, termination, and expiration.
- [x] 3.4 Test pairing-derived relationships do not satisfy active session authorization.

## 4. Docs and Verification

- [x] 4.1 Update security/architecture docs with session authorization lifecycle.
- [x] 4.2 Run typecheck, tests, build, and strict OpenSpec validation.
- [x] 4.3 Archive the completed OpenSpec change.
- [x] 4.4 Commit and push the completed increment.
