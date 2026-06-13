## 1. Protocol Validation

- [x] 1.1 Require reasons for terminal `session-authorization-state` statuses in `packages/protocol/src/messages.ts`.
- [x] 1.2 Add protocol tests proving terminal states with reasons are accepted and terminal states without reasons are rejected.

## 2. Verification

- [x] 2.1 Run the focused protocol test file.
- [x] 2.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.3 Complete security review for the auth/protocol validation diff.

## 3. OpenSpec Completion

- [x] 3.1 Sync the accepted requirement into `openspec/specs/session-authorization-protocol/spec.md`.
- [x] 3.2 Validate and archive the completed OpenSpec change.
