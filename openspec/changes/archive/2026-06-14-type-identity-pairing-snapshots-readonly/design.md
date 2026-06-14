# Design: Read-only identity and pairing snapshot types

## Overview
The protocol package already returns frozen `DeviceIdentity`, `PairingTicket`, and `PairedDevice` records from the shared identity and pairing factories. The exported type surface should document these as immutable snapshots without making schema parsing, local object construction, or test builders cumbersome.

## Approach
- Keep private schema-inferred mutable field types for parsing and constructing records.
- Export `DeviceIdentity`, `PairingTicket`, and `PairedDevice` as read-only snapshot types.
- Cast validated frozen outputs to the exported read-only snapshot types at the return boundary.
- Keep `PairingTicketSchema.parse()` and `PairedDeviceSchema.parse()` outputs locally mutable for validation and builder paths.
- Keep relay audit device-identity detail construction mutable-friendly without making returned `DeviceIdentity` snapshots mutable.
- Update tests with local mutable helper types only where mutation attempts are under test.

## Security Rationale
Identity and pairing records are preconditions for legitimate remote assistance but must not grant remote control by themselves. Type-level immutability reduces the chance that future code treats returned snapshots as mutable state and accidentally changes device identity, reopens consumed pairing tickets, changes expiration, or rewrites paired-device bindings.

## Compatibility
This is a TypeScript compile-time hardening change. Runtime object shapes, JSON serialization, Zod validation, pairing code hashing, ticket consumption, paired-device validation, relay behavior, and authorization behavior remain unchanged. Callers that intentionally need mutable data should copy returned snapshots into local builder objects.

## Alternatives Considered
- Make all schema parse outputs read-only: rejected for this increment because Zod schema inputs and construction tests still benefit from mutable builder objects.
- Add wrapper snapshot objects: rejected because it would change the public shape and create unnecessary migration cost.
