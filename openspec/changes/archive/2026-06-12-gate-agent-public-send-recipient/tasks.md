## 1. Implementation

- [x] 1.1 Track connection-scoped recipient availability after paired `relay-ready` or inbound peer `hello`, and clear it after lifecycle reset or remote disconnect.
- [x] 1.2 Add a public runtime send-recipient guard for peer messages before socket write and `sent` events.
- [x] 1.3 Keep blocked public-send recipient diagnostics secret-safe.
- [x] 1.4 Update the main `agent-shell-consent-workflow` spec with the public-send recipient boundary.

## 2. Verification

- [x] 2.1 Add focused integration coverage for unpaired public `hello` and viewer authorization request sends.
- [x] 2.2 Preserve coverage that paired same-viewer public legacy requests remain non-granting.
- [x] 2.3 Run focused agent-shell runtime integration tests for public-send recipient binding.
- [x] 2.4 Run security review for the send-path diff.
- [x] 2.5 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.6 Validate and archive the completed OpenSpec change.
