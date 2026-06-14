## 1. Type Contract

- [x] 1.1 Mark returned `SessionAuthorization` snapshots read-only at the exported type level, including `permissions`.
- [x] 1.2 Mark returned `SessionGrant` snapshots read-only at the exported type level, including `permissions`, `requiresHostApproval`, and `visibleSessionRequired`.
- [x] 1.3 Keep schema input construction and permission list parsing mutable-friendly.

## 2. Tests

- [x] 2.1 Update authorization immutability tests so intentional mutation attempts use explicit mutable test casts.
- [x] 2.2 Update consent-bound grant immutability tests so intentional mutation attempts use explicit mutable test casts.
- [x] 2.3 Run focused authorization and protocol grant tests.

## 3. Verification

- [x] 3.1 Review the auth type-only change for consent boundary, permission widening, host visibility, grant flags, audit evidence, and abuse-resistance impact.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Archive the OpenSpec change after implementation is verified.
