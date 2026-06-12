## 1. Runtime Send Gate

- [x] 1.1 Add a public runtime send gate for workflow-authority protocol messages.
- [x] 1.2 Preserve internal workflow sends for explicit host decisions, lifecycle transitions, and workflow audit events.
- [x] 1.3 Keep blocked diagnostics static and secret-safe before socket write and local `sent` event emission.

## 2. Verification Coverage

- [x] 2.1 Add integration tests that public sends of authorization decisions, authorization states, permission revocations, session controls, and audit events are blocked.
- [x] 2.2 Add regression coverage that internal explicit workflow sends still emit consent lifecycle and audit events.
- [x] 2.3 Update agent-shell consent workflow specs and docs with the public workflow-authority send gate.

## 3. Review And Gates

- [x] 3.1 Run focused agent-shell tests for public workflow-authority sends.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Perform security review for auth/audit/log handling and archive the completed OpenSpec change.
