## 1. OpenSpec

- [x] 1.1 Validate the new change strictly before implementation.

## 2. Implementation

- [x] 2.1 Add room membership cleanup and lookup support needed to remove stale viewers after host disconnect.
- [x] 2.2 Update relay disconnect handling to close/remove orphaned viewers and reject forwarding from no-longer-registered peers.
- [x] 2.3 Add `RoomRegistry` unit coverage for host disconnect clearing viewer membership and replacement host fresh pairing.
- [x] 2.4 Add relay integration coverage for replacement host room size, stale viewer disconnect/rejection, and fresh viewer rejoin with the new pairing code.

## 3. Verification

- [x] 3.1 Run focused relay unit and integration tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Perform a security review for relay pairing/disconnect behavior.
- [x] 3.4 Sync specs and archive the completed OpenSpec change after implementation and validation.
