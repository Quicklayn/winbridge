## 1. OpenSpec

- [x] 1.1 Create proposal, design, delta spec, and tasks for viewer rejection of host workflow options.
- [x] 1.2 Validate the active OpenSpec change in strict mode.

## 2. Implementation

- [x] 2.1 Add CLI validation that rejects explicit host-only workflow options for viewer mode before runtime creation.
- [x] 2.2 Add direct runtime validation that rejects viewer host workflow state before relay startup.
- [x] 2.3 Add focused CLI and runtime tests for fail-closed viewer host workflow configuration and preserved valid viewer options.
- [x] 2.4 Update README, architecture, and security model documentation.

## 3. Verification

- [x] 3.1 Run focused agent-shell argument and runtime validation tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete a safety review for the role-boundary diff.

## 4. Completion

- [x] 4.1 Archive the OpenSpec change after implementation and verification.
- [x] 4.2 Commit and push the completed increment to GitHub.
