## 1. Relay Room Snapshot Immutability

- [x] 1.1 Freeze registered `RelayPeer` records before storing them in `RoomRegistry`.
- [x] 1.2 Return immutable peer collections from `RoomRegistry.join()`, `RoomRegistry.leave()`, and `RoomRegistry.peers()` without changing room membership semantics.

## 2. Tests

- [x] 2.1 Add room tests proving join results cannot mutate peer identity, role, device id, or send/close callback references in place.
- [x] 2.2 Add room tests proving `peers()` lookup collections cannot be mutated to change registered membership or send-path behavior.
- [x] 2.3 Add room tests proving leave result collections and removed peer records are immutable while stale-viewer cleanup still works.

## 3. Review and Verification

- [x] 3.1 Review the relay room snapshot change for routing safety, consent boundary, stale-peer cleanup, callback replacement, and abuse-resistance impact.
- [x] 3.2 Run focused relay room tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Sync and archive the OpenSpec change after implementation is verified.
