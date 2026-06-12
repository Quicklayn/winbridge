## 1. Runtime Authority Binding

- [x] 1.1 Bind viewer authorization snapshots to host decisions addressed to the local viewer.
- [x] 1.2 Ignore unbound or mismatched viewer lifecycle authority messages before local received-event emission and workflow state updates.

## 2. Verification Coverage

- [x] 2.1 Add integration tests for unbound state, mismatched authority, and decisions addressed to another viewer.
- [x] 2.2 Update agent-shell consent workflow specs and docs with the authority-binding behavior.

## 3. Review And Gates

- [x] 3.1 Run focused agent-shell tests for viewer authorization authority binding.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Perform security review for auth/log handling and archive the completed OpenSpec change.
