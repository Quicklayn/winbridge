## 1. Runtime Implementation

- [x] 1.1 Route accepted inbound protocol summary logger output through the existing best-effort runtime logger helper after redacted received event emission.
- [x] 1.2 Preserve existing accepted-message processing order, unsafe inbound filtering, redaction, consent, host visibility, signal authorization, and audit persistence behavior.

## 2. Tests

- [x] 2.1 Add integration coverage for accepted inbound protocol summary logger failure on a valid host authorization request.
- [x] 2.2 Assert logger failure remains secret-safe, emits no runtime error event, and does not bypass explicit approval, visible activation, audit, or signal authorization gates.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the active change before implementation.
- [x] 3.2 Run targeted agent-shell integration tests.
- [x] 3.3 Run npm run check.
- [x] 3.4 Run npm test.
- [x] 3.5 Run npm run build.
- [x] 3.6 Run npm run openspec:validate.
- [x] 3.7 Perform security review for accepted inbound diagnostic/log changes and confirm no capture, input, auth bypass, token, relay, installer, service, privilege, persistence, stealth, or consent-bypass behavior is introduced.
