## 1. Type Contract

- [x] 1.1 Mark `AgentShellHostStatusSnapshot` fields read-only at the exported type level.
- [x] 1.2 Mark `AgentShellViewerStatusSnapshot` fields read-only at the exported type level.

## 2. Tests

- [x] 2.1 Update runtime immutable status tests so intentional mutation attempts use explicit mutable test casts.
- [x] 2.2 Rename status lifecycle tests to describe immutable snapshots.

## 3. Verification

- [x] 3.1 Review the type-only status change for consent boundary, visibility, revocation, disconnect, audit-safety, and abuse-resistance impact.
- [x] 3.2 Run focused agent-shell status tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Archive the OpenSpec change after implementation is verified.
