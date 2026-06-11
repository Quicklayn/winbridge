## 1. Session Control Schema Hardening

- [x] 1.1 Require `permission` when `session-control.action` is `revoke-permission`.
- [x] 1.2 Reject `permission` when `session-control.action` is `pause`, `resume`, or `terminate`.
- [x] 1.3 Reject whitespace-only `session-control.reason` values when reason is provided.

## 2. Tests

- [x] 2.1 Add protocol tests for valid pause, resume, terminate, and revoke-permission control messages.
- [x] 2.2 Add protocol tests for revoke-permission without permission.
- [x] 2.3 Add protocol tests for pause, resume, and terminate messages that incorrectly carry permission.
- [x] 2.4 Add protocol tests for blank control reasons.

## 3. Review And Verification

- [x] 3.1 Run security review for session-control message hardening.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Archive the completed OpenSpec change and verify no active changes remain.
