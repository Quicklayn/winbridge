## 1. Runtime Implementation

- [x] 1.1 Route relay startup warning logging through a best-effort logger helper.
- [x] 1.2 Route relay listening informational logging through a best-effort logger helper.
- [x] 1.3 Preserve existing mandatory startup audit failure behavior.

## 2. Tests

- [x] 2.1 Add integration coverage for relay startup diagnostic logger failure.
- [x] 2.2 Assert logger failure remains secret-safe, startup succeeds after mandatory audit, and relay admission/forwarding/consent boundaries are unchanged.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the active change before implementation.
- [x] 3.2 Run targeted relay integration tests.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
- [x] 3.7 Perform security review for relay startup/log diagnostic changes and confirm no consent, visibility, capture, input, auth semantics, token, installer, service, privilege, persistence, or stealth behavior is introduced.
