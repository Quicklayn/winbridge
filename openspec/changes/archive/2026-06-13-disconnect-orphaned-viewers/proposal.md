## Why

The relay currently cleans up only the peer that disconnects. If a host disconnects while a viewer socket remains open, a later replacement host for the same `sessionId` can create a new pairing ticket while the old viewer remains registered and eligible as a recipient without consuming that new ticket.

## What Changes

- End the current relay pairing scope when the registered host disconnects from a paired room.
- Close and remove remaining viewer peers from that room after delivering the bounded `peer-disconnected` notice.
- Reject messages from any socket whose local registration no longer appears in room membership before forwarding.
- Preserve normal replacement-host behavior: a replacement host can join with a new pairing code, but a viewer must reconnect and consume the replacement host's current pairing ticket.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-broker`: host disconnect cleanup clears stale viewer room membership so replacement host pairing cannot reuse an old viewer.
- `identity-pairing`: development relay pairing ticket scope is tied to the current host room lifecycle.
- `relay-runtime`: integration coverage verifies stale viewer sockets are disconnected or fail closed before replacement-host forwarding.

## Impact

- Affected code: `apps/relay/src/rooms.ts`, `apps/relay/src/server.ts`, relay unit tests, relay integration tests, and OpenSpec specs.
- Affected systems: development relay room lifecycle, pairing-gated joins, disconnect cleanup, relay audit metadata.
- Safety impact: strengthens pairing and consent boundaries by preventing stale peer reuse across host replacement.
- Non-goals: no reconnect feature, no persistence, no native capture/input, no hidden session behavior, no credential access, no Windows prompt bypass, and no production authentication model.
