## 1. OpenSpec

- [x] 1.1 Create proposal, design, delta spec, and implementation task list for the agent-shell device-id boundary.
- [x] 1.2 Validate the active OpenSpec change in strict mode.

## 2. Implementation

- [x] 2.1 Reject secret-bearing CLI `--device` values with bounded usage errors before runtime construction.
- [x] 2.2 Reject secret-bearing direct runtime `deviceId` values before relay startup or protocol sends.
- [x] 2.3 Add focused CLI and runtime tests for rejected secret-bearing device ids and safe valid ids.
- [x] 2.4 Update docs for the agent-shell device-id metadata boundary.

## 3. Verification

- [x] 3.1 Run focused agent-shell argument/runtime tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete security review for the device-id validation diff.

## 4. Completion

- [x] 4.1 Archive the completed OpenSpec change after validation.
- [x] 4.2 Commit and push the completed increment to GitHub.
