## 1. Implementation

- [x] 1.1 Add a public runtime outbound session guard before workflow, signal, socket, and local `sent` event handling.
- [x] 1.2 Keep blocked cross-session send diagnostics secret-safe.
- [x] 1.3 Update the main `agent-shell-consent-workflow` spec with the public-send session boundary.

## 2. Verification

- [x] 2.1 Add focused integration coverage for cross-session public sends that would otherwise emit `sent` events or socket writes.
- [x] 2.2 Run focused agent-shell runtime integration tests for public-send session binding.
- [x] 2.3 Run security review for the send-path diff.
- [x] 2.4 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.5 Validate and archive the completed OpenSpec change.
