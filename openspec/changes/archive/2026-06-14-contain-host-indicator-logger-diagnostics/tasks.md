## 1. Runtime Implementation

- [x] 1.1 Route host indicator diagnostic logger output through a best-effort logger helper after indicator event emission.
- [x] 1.2 Preserve existing host indicator event callback behavior and visible approval/audit ordering.

## 2. Tests

- [x] 2.1 Add integration coverage for active host indicator diagnostic logger failure during visible approval.
- [x] 2.2 Assert logger failure remains secret-safe, active state and active audit still emit, and no capture, input, reconnect, hidden-session, or consent-bypass behavior is introduced.

## 3. Verification

- [x] 3.1 Run strict OpenSpec validation for the active change before implementation.
- [x] 3.2 Run targeted agent-shell integration tests.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
- [x] 3.7 Perform security review for host visibility/log diagnostic changes and confirm no capture, input, auth semantics, token, installer, service, privilege, persistence, stealth, or consent-bypass behavior is introduced.
