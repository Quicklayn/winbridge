## 1. OpenSpec

- [x] 1.1 Create proposal, design, delta spec, and tasks for host one-shot status printing.
- [x] 1.2 Validate the active OpenSpec change in strict mode.

## 2. Implementation

- [x] 2.1 Add host status CLI argument parsing, host-only validation, bounded delay parsing, and host-control prompt conflict rejection.
- [x] 2.2 Add a host status scheduling helper that reads `getHostStatus()` only and formats failures through secret-safe CLI diagnostics.
- [x] 2.3 Wire host status scheduling into the agent shell entrypoint and shutdown cleanup.
- [x] 2.4 Add focused tests for argument validation and host status scheduling safety.
- [x] 2.5 Update README, architecture, and security model documentation.

## 3. Verification

- [x] 3.1 Run focused agent-shell host status and argument tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete a safety review for the host status CLI diff.

## 4. Completion

- [x] 4.1 Archive the OpenSpec change after implementation and verification.
- [x] 4.2 Commit and push the completed increment to GitHub.
