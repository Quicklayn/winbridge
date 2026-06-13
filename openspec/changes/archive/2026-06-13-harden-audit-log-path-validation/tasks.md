## 1. Implementation

- [x] 1.1 Add shared audit log path validation for ASCII control characters and 1024-byte maximum length.
- [x] 1.2 Apply shared validation to relay audit path configuration.
- [x] 1.3 Apply shared validation to agent-shell CLI and environment audit path parsing.
- [x] 1.4 Update README, architecture, and security docs for the stricter audit path contract.

## 2. Verification

- [x] 2.1 Add focused tests for shared sink, relay env, and agent CLI/env audit path rejection.
- [x] 2.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.3 Complete security review for audit/log validation changes.
