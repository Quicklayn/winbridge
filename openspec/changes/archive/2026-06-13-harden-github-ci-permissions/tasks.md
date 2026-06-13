## 1. CI Hardening

- [x] 1.1 Add explicit read-only repository contents permissions to the GitHub Actions CI workflow.
- [x] 1.2 Add an explicit timeout to the Windows verification matrix job without changing the Node version matrix or verification steps.

## 2. Documentation and Specs

- [x] 2.1 Update GitHub setup documentation to describe the least-privilege and timeout-bounded CI behavior.
- [x] 2.2 Sync the new agent-orchestration CI hardening requirement into the main spec during archive.

## 3. Verification

- [x] 3.1 Run `npm run check`.
- [x] 3.2 Run `npm test`.
- [x] 3.3 Run `npm run build`.
- [x] 3.4 Run `npm run openspec:validate`.
- [x] 3.5 Review the workflow diff for unchanged runtime/product behavior and least-privilege CI scope.
