## 1. Runtime Lifecycle

- [x] 1.1 Generate approval and active authorization messages from a consistent grant timestamp.
- [x] 1.2 Schedule host authorization expiration from the stored `expiresAt` boundary.

## 2. Verification

- [x] 2.1 Run focused agent-shell lifecycle tests for short TTL revoke, terminate, pause, and expiration paths.
- [x] 2.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.3 Complete security review for the auth/workflow timing diff.

## 3. OpenSpec Completion

- [x] 3.1 Sync the accepted requirement into `openspec/specs/agent-shell-consent-workflow/spec.md`.
- [x] 3.2 Validate and archive the completed OpenSpec change.
