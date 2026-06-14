## 1. Authorization Snapshot Immutability

- [x] 1.1 Add a local immutable snapshot helper in `packages/protocol/src/authorization.ts` and route exported authorization outputs through it.
- [x] 1.2 Ensure returned nested permission arrays are frozen for created, transitioned, expired, terminal-preserved, and action-authorized records.

## 2. Tests

- [x] 2.1 Add protocol tests proving returned pending and active authorization snapshots cannot be mutated in place.
- [x] 2.2 Add protocol tests proving expiration and terminal-preserved snapshots remain immutable and fail closed.

## 3. Review and Verification

- [x] 3.1 Review the auth change for consent, visibility, revocation, audit, and abuse-resistance impact.
- [x] 3.2 Run focused authorization tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Sync and archive the OpenSpec change after implementation is verified.
