## Why

Device identity, pairing tickets, and paired-device records become trusted identity and pairing inputs after shared schema validation. If those returned records remain mutable, caller code can accidentally alter device binding, ticket use counts, expiration, or salted hash metadata after validation.

## What Changes

- Return immutable snapshots from shared identity and pairing factories.
- Freeze `createDeviceIdentity`, `createPairingTicket`, `consumePairingTicket`, and `createPairedDevice` results after validation.
- Preserve existing validation, pairing-code hashing, ticket consumption, pairing record shape, and JSON serialization behavior.
- Add regression tests proving accepted identity and pairing records cannot be mutated after validation.
- Non-goal: add no new remote action permission, production identity, reconnect, relay routing behavior, capture, input, clipboard, file transfer, diagnostics, installer, startup, service, token, credential, logging sink, or privilege-elevation capability.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `identity-pairing`: accepted device identity, pairing ticket, and paired-device records become immutable after validation.

## Impact

- Affected code: `packages/protocol/src/identity.ts` and `packages/protocol/src/identity.test.ts`.
- Consumers still receive the same plain JSON-compatible record shape, but post-validation mutation fails instead of silently changing trusted pairing or identity state.
- This touches identity/pairing safety only; it does not alter capture, input, relay transport, installer, service, native Windows API, startup, persistence, credential, or privilege behavior.
