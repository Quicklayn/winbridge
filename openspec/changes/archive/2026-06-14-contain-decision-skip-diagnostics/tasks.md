## 1. Runtime Implementation

- [x] 1.1 Route the viewer-disconnected authorization decision skip diagnostic through the existing best-effort logger helper.
- [x] 1.2 Preserve the existing fail-closed checks for recipient availability, observed peer role, and observed peer id.
- [x] 1.3 Preserve successful authorization decision behavior and audit/indicator gates.

## 2. Tests

- [x] 2.1 Add integration coverage for a host consent decision resolving after viewer disconnect when the skip diagnostic logger throws.
- [x] 2.2 Assert the logger failure emits no runtime error and sends no authorization decision, state, lifecycle control, permission revocation, signal, or workflow audit messages.
- [x] 2.3 Assert the logger failure remains secret-safe and does not emit an active host indicator.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the active change before implementation.
- [x] 3.2 Run targeted agent-shell integration tests for the decision skip diagnostic path.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
- [x] 3.7 Run `git diff --check`.
- [x] 3.8 Perform security review for the auth/log path and confirm no capture, input, relay, installer, startup, service, token, privilege, persistence, stealth, or consent-bypass behavior is introduced.
