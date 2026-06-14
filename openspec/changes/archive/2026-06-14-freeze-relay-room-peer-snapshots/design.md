## Context

`apps/relay/src/rooms.ts` owns the in-memory membership state for the development relay. After a join succeeds, callers receive `RelayPeer` objects through join results, leave results, and `peers()` lookups. Those objects contain trusted routing identity (`peerId`, `role`, `sessionId`, `deviceId`) and transport callbacks (`send`, `close`).

Recent hardening made protocol, authorization, audit, and identity records immutable after validation. Relay room peer records still expose mutable objects that are also used for routing decisions.

## Goals / Non-Goals

**Goals:**

- Freeze registered `RelayPeer` records before storing them in room state.
- Return immutable peer arrays from `join()`, `leave()`, and `peers()` so callers cannot mutate result collections in place.
- Preserve room size, pairing ticket creation/consumption, stale-viewer cleanup, and existing send/close callback behavior.
- Add focused tests for join, lookup, and leave snapshots.

**Non-Goals:**

- No reconnect semantics, multi-viewer routing, production identity, production authorization, native Windows API, capture, input, clipboard, file transfer, diagnostics, installer, service, startup persistence, credentials, keylogging, evasion, or Windows prompt behavior.
- No change to WebSocket transport, relay audit schema, pairing ticket parameters, or protocol message schemas.
- No broad readonly TypeScript migration.

## Decisions

1. Freeze the stored peer record at registration.

   `RoomRegistry` already copies caller-provided join input into a new `registeredPeer` object. Freezing this copy prevents later mutation of trusted room identity while preserving the transport callbacks by reference.

2. Freeze returned peer arrays.

   Returning frozen arrays catches accidental collection mutation such as pushing synthetic peers into a join result or query result. The room registry still owns membership mutations through `join()` and `leave()` only.

3. Keep function callbacks callable.

   `Object.freeze` prevents replacing `send` and `close`, but it does not prevent invoking them. That preserves current relay disconnect and forwarding paths while making send-path replacement explicit through future room APIs instead of out-of-band mutation.

## Risks / Trade-offs

- [Risk] A test or future caller mutates returned peer arrays as scratch data. -> Mitigation: callers can copy with `[...rooms.peers(sessionId)]` for local scratch work; mutation of trusted registry results is unsafe.
- [Risk] Freezing functions gives a false impression that callback internals are immutable. -> Mitigation: the safety goal is to prevent replacing trusted callback references or peer identity fields, not to make closure state immutable.
- [Risk] Runtime freeze adds small overhead. -> Mitigation: rooms contain at most one host and one viewer in the current development relay, so cost is negligible.
