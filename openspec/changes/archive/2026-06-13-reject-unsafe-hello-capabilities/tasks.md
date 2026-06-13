## 1. Spec Updates

- [x] 1.1 Update session-broker requirements for unsafe `hello` capability rejection.
- [x] 1.2 Update agent-shell requirements for inbound/public unsafe capability rejection.
- [x] 1.3 Update relay runtime requirements for malformed capability rejection coverage.

## 2. Implementation

- [x] 2.1 Harden shared protocol `hello.capabilities` validation.
- [x] 2.2 Update docs describing capability metadata constraints.

## 3. Regression Tests

- [x] 3.1 Add protocol parse/encode tests for unsafe capability metadata and secret-safe diagnostics.
- [x] 3.2 Extend relay integration coverage for unsafe capability rejection before forwarding.
- [x] 3.3 Extend agent-shell inbound and public-send coverage for unsafe capability rejection before trusted events/socket writes.

## 4. Verification And Review

- [x] 4.1 Run focused protocol, relay, and agent-shell tests.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.3 Complete security review for protocol/relay/agent-shell metadata handling and resolve findings.
- [x] 4.4 Sync implemented requirements into main specs.
- [x] 4.5 Archive the OpenSpec change after implementation and validation.
