## 1. Agent Shell Disconnect Binding

- [x] 1.1 Add an inbound `peer-disconnected` guard that accepts only the observed opposite-role peer before state mutation or `received` event emission.
- [x] 1.2 Add integration tests for unbound and mismatched disconnect notices remaining secret-safe and non-state-changing.

## 2. Verification

- [x] 2.1 Run focused agent-shell disconnect binding tests.
- [x] 2.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.3 Complete security review for the agent-shell lifecycle/logging diff.

## 3. OpenSpec Completion

- [x] 3.1 Sync the accepted requirement into `openspec/specs/agent-shell-consent-workflow/spec.md`.
- [x] 3.2 Validate and archive the completed OpenSpec change.
