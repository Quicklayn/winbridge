## 1. Specification

- [x] 1.1 Create proposal, design, and delta specs for the MVP smoke check.

## 2. Implementation

- [x] 2.1 Add a root `mvp:smoke` script and smoke-check implementation under `scripts/`.
- [x] 2.2 Keep the smoke check bounded, local-only, static-frame-only, and ensure child processes are stopped on all exits.
- [x] 2.3 Add focused tests for argument validation, command composition, timeout cleanup, and sanitized diagnostics.
- [x] 2.4 Update README/docs with the new smoke-check preflight workflow and safety scope.

## 3. Verification

- [x] 3.1 Run focused smoke-check tests.
- [x] 3.2 Run the local MVP smoke check.
- [x] 3.3 Run security review for process orchestration, auth/log handling, and child cleanup.
- [x] 3.4 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
