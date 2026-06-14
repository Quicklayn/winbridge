## 1. Runtime Implementation

- [x] 1.1 Route WebSocket socket-error logging through a best-effort logger helper.
- [x] 1.2 Preserve existing metadata-only socket error formatting and avoid raw error text in logs/events.

## 2. Tests

- [x] 2.1 Add integration coverage for diagnostic logger failure during socket-error reporting.
- [x] 2.2 Assert logger failure remains secret-safe and does not send protocol messages, grant permissions, activate visibility, or bypass consent.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the active change before implementation.
- [x] 3.2 Run targeted agent-shell runtime integration tests.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
- [x] 3.7 Perform security review for agent-shell log/diagnostic changes and confirm no consent, visibility, capture, input, auth semantics, token, installer, startup, service, privilege, persistence, or stealth behavior is introduced.
