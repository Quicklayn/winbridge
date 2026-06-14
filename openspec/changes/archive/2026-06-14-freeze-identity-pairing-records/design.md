## Context

`packages/protocol/src/identity.ts` is the shared validation boundary for development device identity and pairing records. It creates local device identity metadata, host-created pairing tickets, consumed ticket snapshots, and paired-device records used by the relay pairing lifecycle.

Recent hardening made authorization records, consent grants, protocol envelopes, and audit records immutable after validation. Identity and pairing records still return mutable objects, which leaves trusted pairing state open to accidental post-validation mutation.

## Goals / Non-Goals

**Goals:**

- Freeze records returned by `createDeviceIdentity`, `createPairingTicket`, `consumePairingTicket`, and `createPairedDevice`.
- Preserve validation, salted pairing-code hashes, remaining-use decrement semantics, and JSON-compatible output shape.
- Add focused tests for device identity, ticket creation/consumption, and paired-device immutability.

**Non-Goals:**

- No production account authentication, durable identity store, reconnect policy, native Windows API, capture, input, clipboard, file transfer, diagnostics, installer, service, startup persistence, credentials, keylogging, evasion, or Windows prompt behavior.
- No broad TypeScript `readonly` migration.
- No change to pairing-code format, hash algorithm, ticket TTL rules, or relay room routing.

## Decisions

1. Freeze at factory boundaries.

   The schema parse remains the authority for accepting identity and pairing records. Freezing the parsed output gives callers a stable snapshot without changing accepted input or output fields.

2. Return a new immutable ticket from consumption.

   `consumePairingTicket` already creates a new ticket object with decremented `remainingUses`. The change keeps that copy-on-consume behavior and freezes the returned consumed ticket, while the original ticket remains unchanged.

3. Keep serialization and relay behavior unchanged.

   `Object.freeze` affects runtime mutability only. The relay can continue assigning the new consumed ticket snapshot into room state without mutating record fields in place.

## Risks / Trade-offs

- Existing caller mutates pairing records after creation -> Current repository usage assigns replacement records instead of mutating fields, and post-validation mutation is unsafe.
- Extra freeze work -> Identity and pairing records are small and flat; cost is negligible.
- Repeated local freezer helpers -> Acceptable for a focused change; shared utility extraction can happen later if duplication becomes a maintenance issue.
