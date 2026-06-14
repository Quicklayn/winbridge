## 1. Runtime Implementation

- [x] 1.1 Route non-protocol inbound diagnostic logger output through the existing best-effort runtime logger helper after redacted raw event emission.
- [x] 1.2 Route ignored unsafe decoded inbound diagnostic logger output through the same best-effort helper.
- [x] 1.3 Preserve existing redacted raw event callback behavior, unsafe-input classification, and accepted protocol message logging behavior.

## 2. Tests

- [x] 2.1 Add integration coverage for non-protocol inbound diagnostic logger failure.
- [x] 2.2 Add integration coverage for decoded unsafe inbound protocol diagnostic logger failure.
- [x] 2.3 Assert logger failure remains secret-safe, emits no runtime error event, and sends no authorization, lifecycle, control, permission, signal, disconnect, or workflow audit messages.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the active change before implementation.
- [x] 3.2 Run targeted agent-shell integration tests.
- [x] 3.3 Run npm run check.
- [x] 3.4 Run npm test.
- [x] 3.5 Run npm run build.
- [x] 3.6 Run npm run openspec:validate.
- [x] 3.7 Perform security review for inbound diagnostic/log changes and confirm no capture, input, auth semantics, token, relay, installer, service, privilege, persistence, stealth, or consent-bypass behavior is introduced.
