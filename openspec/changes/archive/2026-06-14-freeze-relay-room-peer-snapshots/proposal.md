## Why

`RoomRegistry` is the in-memory trust boundary for development relay membership. It currently exposes registered peer objects through join, leave, and lookup results, so caller code can accidentally mutate peer identity or send-path metadata after registration.

## What Changes

- Return immutable relay peer snapshots from `RoomRegistry.join()`, `RoomRegistry.leave()`, and `RoomRegistry.peers()`.
- Store registered peer records as immutable snapshots after pairing and role checks pass.
- Preserve existing room limits, pairing-ticket lifecycle, stale-viewer cleanup, send/close callbacks, and JSON-visible peer shape.
- Add regression tests proving returned peer arrays and peer records cannot be changed in place and that failed mutation cannot replace peer identity or send-path behavior.
- Non-goal: add no new capture, input, clipboard, file transfer, diagnostics, reconnect, hidden session, unattended access, installer, startup, service, token, credential, logging sink, or privilege-elevation capability.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-broker`: relay room membership snapshots become immutable after registration so caller mutation cannot change trusted peer routing state.

## Impact

- Affected code: `apps/relay/src/rooms.ts` and `apps/relay/src/rooms.test.ts`.
- Affected specs: `openspec/specs/session-broker/spec.md`.
- The change touches relay room routing state only. It does not touch native Windows APIs, screen capture, remote input, installer behavior, startup behavior, services, tokens, credentials, privilege elevation, or production authorization.
