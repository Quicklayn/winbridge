## 1. Identity and Pairing Immutability

- [x] 1.1 Add a local immutable snapshot helper in `packages/protocol/src/identity.ts`.
- [x] 1.2 Route `createDeviceIdentity`, `createPairingTicket`, `consumePairingTicket`, and `createPairedDevice` outputs through immutable validated records without changing record shape.

## 2. Tests

- [x] 2.1 Add identity tests proving returned device identity records cannot be mutated in place.
- [x] 2.2 Add pairing tests proving created and consumed pairing tickets cannot be mutated in place and original tickets remain unchanged after consumption.
- [x] 2.3 Add paired-device tests proving binding records cannot be mutated and serialization remains the same JSON-compatible shape.

## 3. Review and Verification

- [x] 3.1 Review the identity/pairing change for pairing safety, consent boundary, replay resistance, secret handling, and abuse-resistance impact.
- [x] 3.2 Run focused identity pairing tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Sync and archive the OpenSpec change after implementation is verified.
