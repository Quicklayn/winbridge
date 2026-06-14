## 1. Authorization Schema

- [x] 1.1 Add authorization-local refined schemas for `sessionId`, `hostPeerId`, and `viewerPeerId` using the shared secret-bearing protocol identifier classifier.
- [x] 1.2 Wire the refined schemas into `SessionAuthorizationSchema` without changing safe development identifier behavior.

## 2. Tests

- [x] 2.1 Add focused authorization tests for pending creation and parsed record rejection of secret-bearing `sessionId`, `hostPeerId`, and `viewerPeerId`.
- [x] 2.2 Assert rejection diagnostics remain bounded and do not echo raw rejected identifiers.
- [x] 2.3 Run the focused authorization test file.

## 3. Specs, Review, and Verification

- [x] 3.1 Validate the active OpenSpec change in strict mode.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete security review for the auth/token-adjacent change and confirm no consent, visibility, revoke, capture, input, relay, installer, startup, service, log, persistence, privilege elevation, hidden-session, or Windows prompt-bypass behavior was added or weakened.
- [x] 3.4 Sync accepted delta specs into `openspec/specs/`, archive the completed change, commit, and push.
