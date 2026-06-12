## 1. Protocol Contract

- [x] 1.1 Require `authorizationId` on `session-control` protocol messages and cover missing/valid controls in protocol tests.
- [x] 1.2 Update relay integration fixtures that construct `session-control` messages so schema validation still exercises authority and recipient gates.

## 2. Agent Shell Binding

- [x] 2.1 Include `authorizationId` on host-generated pause, resume, and terminate controls.
- [x] 2.2 Require inbound viewer `session-control` messages to match the current bound authorization id and host authority before local received-event emission or state mutation.
- [x] 2.3 Add agent-shell integration coverage for mismatched control authorization ids and bound controls.

## 3. Documentation And Gates

- [x] 3.1 Update architecture/security docs for authorization-bound session controls.
- [x] 3.2 Run focused protocol/agent-shell/relay tests for session-control binding.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Perform security review for auth/protocol handling and archive the completed OpenSpec change.
