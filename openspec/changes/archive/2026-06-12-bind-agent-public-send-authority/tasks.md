## 1. Implementation

- [x] 1.1 Add a public runtime send-authority guard for join-only, relay-originated, presence, and viewer-request messages.
- [x] 1.2 Keep blocked public-send authority diagnostics secret-safe.
- [x] 1.3 Update the main `agent-shell-consent-workflow` spec with the public-send authority boundary.

## 2. Verification

- [x] 2.1 Add focused integration coverage for blocked public `join-session`, relay-originated lifecycle, spoofed `hello`, and role-mismatched viewer request sends.
- [x] 2.2 Preserve coverage that valid same-session viewer legacy consent requests remain non-granting.
- [x] 2.3 Run focused agent-shell runtime integration tests for public-send authority binding.
- [x] 2.4 Run security review for the send-path diff.
- [x] 2.5 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.6 Validate and archive the completed OpenSpec change.
