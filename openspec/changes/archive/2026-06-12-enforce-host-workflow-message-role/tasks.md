# Tasks

## 1. Relay Role Enforcement

- [x] 1.1 Require registered host role for `session-authorization-state`, `permission-revoked`, `session-control`, and `audit-event`.
- [x] 1.2 Preserve existing actor peer id and recipient targeting checks for those messages.

## 2. Tests and Documentation

- [x] 2.1 Add relay integration tests proving viewer-originated host workflow messages are rejected before forwarding.
- [x] 2.2 Update `session-broker`, `relay-runtime`, architecture, and security docs for host-only workflow message authority.

## 3. Verification and Review

- [x] 3.1 Run focused relay tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete security review for relay consent workflow role enforcement.
- [x] 3.4 Archive the completed OpenSpec change.
