## 1. Protocol Contract

- [x] 1.1 Extend `HelloMessageSchema` to accept optional schema-validated `deviceIdentity` and reject display-name mismatch.
- [x] 1.2 Add protocol tests for accepted, omitted, mismatched, and unsafe `hello.deviceIdentity` metadata.

## 2. Agent Shell Consent Context

- [x] 2.1 Send one locally created device identity in both `join-session` and `hello` peer metadata.
- [x] 2.2 Track trusted opposite-role viewer device identity from `hello` and pass bounded device id and platform to host consent providers.
- [x] 2.3 Render viewer device identity in the interactive host consent prompt with safe unavailable fallbacks.
- [x] 2.4 Add agent-shell tests for provider propagation, stale metadata clearing, prompt rendering, and unsafe metadata suppression.

## 3. Documentation And Review

- [x] 3.1 Update README and security/architecture docs for non-authorizing viewer device identity consent context.
- [x] 3.2 Run a focused security review for consent, visibility, audit, and abuse-resistance impact.

## 4. Verification

- [x] 4.1 Run targeted protocol and agent-shell tests for this change.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.3 Run strict OpenSpec validation for `surface-viewer-device-identity-in-consent`.
