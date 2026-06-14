# Design: Read-only relay room peer snapshot types

## Overview
`RoomRegistry` already stores frozen `RelayPeer` records and returns frozen arrays from `join()`, `leave()`, and `peers()`. The type surface should reflect this immutable snapshot contract so callers cannot accidentally write code that mutates trusted routing identity or callback references.

## Approach
- Change `RelayPeer` to `Readonly<{ ... }>` without changing its fields.
- Change result collections to `readonly RelayPeer[]`.
- Change `RoomRegistry.peers()` and helper return types to read-only arrays.
- Adjust internal helper/function signatures where read-only arrays are consumed but not mutated.
- Keep tests that assert runtime immutability by using local mutable test casts for intentional mutation attempts.

## Security Rationale
Relay peer records contain routing identity and callback references used to forward or close connections. Runtime freezing already prevents in-place mutation. Type-level read-only contracts reduce the chance of new relay code depending on mutable snapshots and keep the development relay aligned with the consent-first safety model.

## Compatibility
This is a TypeScript compile-time hardening change. Runtime object shape, JSON output, WebSocket messages, relay room membership semantics, and pairing behavior remain unchanged. Callers that were intentionally mutating returned snapshots must switch to local copies.

## Alternatives Considered
- Leave types mutable: rejected because it documents a capability runtime does not provide.
- Introduce wrapper snapshot objects: rejected because it would change the public shape and add churn without extra safety value.
