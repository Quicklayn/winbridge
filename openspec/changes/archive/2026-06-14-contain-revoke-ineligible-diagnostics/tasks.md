## 1. Runtime Implementation

- [x] 1.1 Route the scheduled revoke diagnostic for missing revoke permission through a best-effort logger helper.
- [x] 1.2 Route the scheduled revoke diagnostic for out-of-grant revoke permission through the same best-effort helper.
- [x] 1.3 Preserve active visible authorization and existing revoke eligibility semantics.

## 2. Tests

- [x] 2.1 Add integration coverage for out-of-grant scheduled revoke diagnostic logger failure.
- [x] 2.2 Assert logger failure remains secret-safe, emits no runtime error, and sends no revoke control, permission-revoked state, revoked authorization state, or revoke audit messages.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the active change before implementation.
- [x] 3.2 Run targeted agent-shell integration tests.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
- [x] 3.7 Perform security review for host revoke diagnostic changes and confirm no capture, input, auth semantics, token, relay, installer, service, privilege, persistence, stealth, or consent-bypass behavior is introduced.
