## 1. Runtime Implementation

- [x] 1.1 Route the configured grant-scope mismatch diagnostic logger output through the existing best-effort runtime logger helper.
- [x] 1.2 Preserve no authorization decision, no active state, no indicator, no workflow audit, no signal authorization, and no capture/input behavior when configured grant scope is not requested.

## 2. Tests

- [x] 2.1 Add integration coverage for configured grant-scope mismatch diagnostic logger failure.
- [x] 2.2 Assert logger failure remains secret-safe, emits no runtime error event, does not emit authorization/audit/indicator/signal messages, and does not authorize signal sends.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the active change before implementation.
- [x] 3.2 Run targeted agent-shell integration tests.
- [x] 3.3 Run npm run check.
- [x] 3.4 Run npm test.
- [x] 3.5 Run npm run build.
- [x] 3.6 Run npm run openspec:validate.
- [x] 3.7 Perform security review for grant-scope diagnostic/log changes and confirm no capture, input, auth bypass, token, relay, installer, service, privilege, persistence, stealth, or consent-bypass behavior is introduced.
