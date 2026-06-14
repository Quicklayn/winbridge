## 1. Relay Pairing Timestamp

- [x] 1.1 Update `RoomRegistry.join()` to capture one viewer pairing decision timestamp and reuse it for ticket consumption and paired-device creation.

## 2. Tests

- [x] 2.1 Add a room-registry regression test for a viewer join accepted just before ticket expiration while the injected clock advances before any later `now()` call.
- [x] 2.2 Confirm expired ticket denial remains unchanged and does not register the viewer.

## 3. Review and Verification

- [x] 3.1 Review the relay timestamp change for consent boundary, pairing TTL, max-use, self-pairing, and audit-safety impact.
- [x] 3.2 Run focused relay room tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Sync and archive the OpenSpec change after implementation is verified.
