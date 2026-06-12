## 1. Host Revoke Workflow

- [x] 1.1 Emit authorization-bound revoke-permission `session-control` before `permission-revoked` in host revoke simulation.
- [x] 1.2 Preserve existing revocation state and audit behavior, including final-permission revocation and partial revocation.

## 2. Viewer Fail-Closed Coverage

- [x] 2.1 Add integration coverage that viewer signal sends fail closed immediately after a bound revoke-permission control for `screen:view`.
- [x] 2.2 Cover secret-safe redaction for revoke control reason text in local sent/received events.

## 3. Documentation And Gates

- [x] 3.1 Update architecture/security docs for explicit revoke controls.
- [x] 3.2 Run focused agent-shell tests for revoke controls.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Perform security review for auth/protocol handling and archive the completed OpenSpec change.
