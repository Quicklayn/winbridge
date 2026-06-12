## 1. Implementation

- [x] 1.1 Require `reason` for `revoke-permission` session-control messages in `packages/protocol/src/messages.ts`.
- [x] 1.2 Add focused protocol tests rejecting revoke controls without reason and accepting non-revoke controls without optional reasons.
- [x] 1.3 Sync the accepted requirement into `openspec/specs/session-authorization-protocol/spec.md`.

## 2. Verification

- [x] 2.1 Run focused protocol message tests.
- [x] 2.2 Run `npm run check`.
- [x] 2.3 Run `npm test`.
- [x] 2.4 Run `npm run build`.
- [x] 2.5 Run `npm run openspec:validate`.
- [x] 2.6 Complete focused security review for authorization protocol behavior.
