## 1. Viewer Authority Binding

- [x] 1.1 Add an inbound viewer `session-authorization-decision` guard that requires `hostPeerId` to match the observed opposite-role host before event emission or state mutation.
- [x] 1.2 Update valid synthetic viewer lifecycle test streams to include explicit observed host presence.
- [x] 1.3 Add integration tests for unobserved-host and mismatched-host decisions remaining secret-safe and non-authorizing.

## 2. Verification

- [x] 2.1 Run focused agent-shell viewer decision binding tests.
- [x] 2.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.3 Complete security review for the agent-shell authorization lifecycle/logging diff.

## 3. OpenSpec Completion

- [x] 3.1 Sync the accepted requirement into `openspec/specs/agent-shell-consent-workflow/spec.md`.
- [x] 3.2 Validate and archive the completed OpenSpec change.
