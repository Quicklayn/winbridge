## Why

The relay currently converts every WebSocket message to text before protocol validation. A peer can therefore force unnecessary allocation and JSON parsing work with an oversized message that should never be treated as a trusted protocol envelope.

## What Changes

- Add a relay-side raw WebSocket message byte limit before `decodeProtocolEnvelope`.
- Reject oversized inbound messages with a bounded relay error when the application handler sees them, or a transport close when the WebSocket payload cap rejects them first.
- Apply existing invalid-message rate-limit accounting to application-level and transport-level oversized message rejection paths.
- Ensure rejection audit details remain secret-safe and do not include raw message bytes or payload contents.
- Add relay integration coverage proving oversized messages are rejected before forwarding.
- Safety impact: reduces denial-of-service risk and prevents oversized arbitrary data from being processed as remote-assistance protocol data.
- Non-goals: no capture, input, clipboard, file transfer, installer, startup, services, privilege elevation, production identity, or transport encryption work.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `relay-abuse-protection`: add raw relay message size rejection as an abuse-protection requirement.
- `relay-runtime`: add integration-test visibility for oversized message rejection.

## Impact

- Affected code: `apps/relay/src/server.ts` and relay integration tests.
- APIs: peers sending messages over the relay must stay within the configured development relay message byte bound.
- Dependencies: none.
- Touched areas: relay, abuse protection, and audit metadata. Does not touch capture, input, authentication, installer behavior, startup behavior, services, tokens, log storage format, or privilege elevation.
