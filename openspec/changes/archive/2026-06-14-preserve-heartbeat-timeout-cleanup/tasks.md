## 1. Relay Implementation

- [x] 1.1 Add bounded heartbeat timeout audit failure warning and containment helper in the relay runtime.
- [x] 1.2 Ensure heartbeat timeout socket termination and normal close cleanup proceed even when timeout audit persistence or warning logging fails.

## 2. Tests

- [x] 2.1 Add integration coverage for heartbeat timeout audit persistence failure preserving peer termination, cleanup, disconnect notice, and secret-safe diagnostics.
- [x] 2.2 Add integration coverage for heartbeat timeout audit warning logger failure being contained.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the active change before implementation.
- [x] 3.2 Run targeted relay integration tests for heartbeat timeout cleanup.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
- [x] 3.7 Perform security review for relay/log changes and confirm no consent, visibility, capture, input, auth, token, installer, startup, service, privilege, persistence, or stealth behavior is introduced.
