## 1. Relay Authority Coverage

- [x] 1.1 Add relay integration coverage for a registered viewer sending legacy `host-consent-decision`.
- [x] 1.2 Verify the relay rejects the forged legacy decision before forwarding and does not leak private reason/grant markers in relay error or audit records.
- [x] 1.3 Verify `host-consent-required` remains a viewer request message and is not treated as host authority.

## 2. Specs And Docs

- [x] 2.1 Sync main `session-broker` and `relay-runtime` specs with the legacy relay decision boundary.
- [x] 2.2 Update security and architecture documentation to name legacy `host-consent-decision` in the relay host-authority boundary.

## 3. Verification And Review

- [x] 3.1 Run focused relay authority tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Perform security review for relay authority and audit/log handling, then archive the completed OpenSpec change.
