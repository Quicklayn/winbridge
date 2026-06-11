## 1. Protocol Validation

- [x] 1.1 Add shared `signal.payload` validation for non-empty objects, serialized size bounds, and recursive sensitive-key rejection.
- [x] 1.2 Add protocol tests for accepted safe signal payloads and rejected empty, oversized, and sensitive-key payloads.

## 2. Relay Behavior

- [x] 2.1 Add relay integration coverage proving unsafe signal payloads return relay errors and are not forwarded.
- [x] 2.2 Update agent-shell integration expectations that previously allowed secret-bearing signal payloads.

## 3. Verification

- [x] 3.1 Run focused protocol and relay tests for signal payload behavior.
- [x] 3.2 Run security review for relay/protocol safety impact.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
