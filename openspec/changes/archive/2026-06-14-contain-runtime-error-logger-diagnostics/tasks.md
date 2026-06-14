## 1. Runtime Implementation

- [x] 1.1 Contain `reportRuntimeError` diagnostic logger failures without changing sanitized runtime error event emission.
- [x] 1.2 Preserve direct host control fail-closed behavior when audited workflow actions fail before sending protocol messages.

## 2. Tests

- [x] 2.1 Add integration coverage for a direct host lifecycle control audit failure where runtime error logging throws.
- [x] 2.2 Assert the direct control still throws only the sanitized runtime error and emits the sanitized runtime error event.
- [x] 2.3 Assert logger failure remains secret-safe and does not send failed lifecycle control, authorization state, permission revocation, signal, or workflow audit messages.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the active change before implementation.
- [x] 3.2 Run targeted agent-shell integration tests for the runtime error logger containment path.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
- [x] 3.7 Run `git diff --check`.
- [x] 3.8 Perform security review for the auth/log path and confirm no capture, input, relay, installer, startup, service, token, privilege, persistence, stealth, or consent-bypass behavior is introduced.
