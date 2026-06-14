## 1. Runtime Implementation

- [x] 1.1 Route agent shell WebSocket-open startup informational logging through a best-effort logger helper.
- [x] 1.2 Preserve existing startup log text and startup join behavior when the logger succeeds.

## 2. Tests

- [x] 2.1 Add integration coverage for diagnostic logger failure during startup informational logging.
- [x] 2.2 Assert logger failure remains secret-safe and does not grant permissions, activate visibility, send consent/lifecycle/control/signal messages, start capture, send input, reconnect peers, or bypass consent.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the active change before implementation.
- [x] 3.2 Run targeted agent-shell runtime integration tests.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
- [x] 3.7 Perform security review for agent-shell startup/log diagnostic changes and confirm no consent, visibility, capture, input, auth semantics, token, installer, service, privilege, persistence, or stealth behavior is introduced.
