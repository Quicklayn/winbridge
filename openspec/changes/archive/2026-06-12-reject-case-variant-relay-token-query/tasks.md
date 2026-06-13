## 1. Implementation

- [x] 1.1 Reject canonical and case-variant `token` query parameters in agent-shell CLI relay URL parsing.
- [x] 1.2 Reject canonical and case-variant `token` query parameters in managed runtime relay URL validation.
- [x] 1.3 Treat case-variant relay `token` query parameter names as token-bearing but invalid before room registration.
- [x] 1.4 Update README and security/architecture docs for canonical token query behavior.

## 2. Verification

- [x] 2.1 Add focused tests for CLI, runtime, and relay case-variant token query rejection.
- [x] 2.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.3 Complete security review for relay/token/auth-adjacent changes.
