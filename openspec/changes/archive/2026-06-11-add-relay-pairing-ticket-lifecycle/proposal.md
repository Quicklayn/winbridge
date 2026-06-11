## Why

The development relay currently compares and stores raw pairing codes inside room peer state. WinBridge already has expiring hashed pairing ticket primitives; the relay should use them now so the broker no longer retains raw pairing secrets and can reject expired or already-consumed pairing material before a viewer joins.

## What Changes

- Create a host-scoped development pairing ticket when the host joins a relay room.
- Store the pairing-code hash in room state instead of the raw pairing code.
- Require viewers to consume the host-created pairing ticket before joining the room.
- Reject viewer joins when the pairing ticket is missing, expired, already consumed, or mismatched.
- Emit secret-safe audit metadata for accepted and denied pairing joins without raw pairing codes.
- Keep pairing as a prerequisite relationship only; it does not approve screen, input, clipboard, file, or diagnostic access.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `identity-pairing`: Relay now uses hashed expiring pairing tickets for development room joins.
- `session-broker`: Viewer joins now require a host-created pairing ticket and fail before registration when pairing is invalid.
- `relay-runtime`: Runtime exposes development pairing ticket TTL/use configuration and verifies expiration/consumption paths.

## Impact

- Affected code: `apps/relay`, focused relay tests, README/docs, and OpenSpec specs.
- API impact: `RoomRegistry` peer state should no longer expose raw pairing codes; relay runtime gains development pairing ticket config.
- Safety impact: reduces pairing secret retention and strengthens join failure behavior before any remote action is possible.
- Touches auth, relay, tokens/secrets, and audit/log behavior; requires security review.
- Non-goals: production account authentication, MFA, durable identity storage, reconnect policy, screen capture, input injection, clipboard sync, file transfer, installer behavior, startup behavior, service registration, privilege elevation, hidden access, or Windows security prompt bypass.
