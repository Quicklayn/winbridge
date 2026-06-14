## 1. Type Contract

- [x] 1.1 Mark `RelayPeer` fields read-only at the exported type level.
- [x] 1.2 Mark `RelayJoinResult.peers`, `RelayLeaveResult.remainingPeers`, `RelayLeaveResult.removedPeers`, and `RoomRegistry.peers()` as read-only peer arrays.

## 2. Tests

- [x] 2.1 Update relay room immutability tests so intentional mutation attempts use explicit mutable test casts.
- [x] 2.2 Run focused relay room tests.

## 3. Verification

- [x] 3.1 Review the type-only relay change for consent boundary, routing identity, callback replacement, disconnect, authorization, audit-safety, and abuse-resistance impact.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Archive the OpenSpec change after implementation is verified.
