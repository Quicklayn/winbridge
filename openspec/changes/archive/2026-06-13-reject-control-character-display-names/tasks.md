## 1. Implementation

- [x] 1.1 Add shared protocol display-name validation for ASCII control characters.
- [x] 1.2 Ensure agent-shell CLI and direct runtime display-name validation inherit the shared rule with bounded diagnostics.
- [x] 1.3 Add protocol tests for device identity, `hello`, and legacy consent request display-name rejection.
- [x] 1.4 Add agent-shell tests for CLI, direct runtime, inbound `hello`, and public-send `hello` display-name rejection.
- [x] 1.5 Update README and security docs for the stricter display-name contract.

## 2. Verification

- [x] 2.1 Run focused display-name validation tests.
- [x] 2.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.3 Complete security review for protocol/display-name validation changes.
