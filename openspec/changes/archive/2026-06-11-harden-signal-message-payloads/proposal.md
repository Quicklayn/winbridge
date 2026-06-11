## Why

`signal` messages are currently opaque relay-forwarded protocol envelopes. That is useful for future negotiation data, but it leaves an avoidable gap where peers can send empty, oversized, or obviously sensitive payloads before the relay rejects them.

## What Changes

- Require `signal.payload` to be a non-empty JSON object with a bounded serialized size.
- Reject `signal.payload` objects that contain obvious secret, credential, pairing-code, keystroke, screenshot, or screen-content keys at any nesting level.
- Keep signaling contents otherwise opaque so future WebRTC offer/answer/ICE metadata can still pass through the protocol.
- Add focused protocol and relay integration tests proving unsafe signal messages are rejected before forwarding.
- Safety impact: reduces accidental or abusive transport of secrets and raw remote-assistance data through the signaling channel.
- Non-goals: no screen capture, input injection, clipboard, file transfer, persistence, installer, service, privilege elevation, production identity, or WebRTC implementation work.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-broker`: add signal payload validation requirements for relay-forwarded protocol messages.
- `relay-runtime`: expose rejection of unsafe signal payloads through relay integration tests and secret-safe audit metadata.

## Impact

- Affected code: `packages/protocol/src/messages.ts`, protocol tests, and relay integration tests.
- APIs: narrows accepted `signal` envelopes by rejecting empty, oversized, and sensitive-key payloads.
- Dependencies: none.
- Touched areas: relay and protocol validation. Does not touch capture, input, authentication, installer behavior, startup behavior, services, tokens, logs storage format, or privilege elevation.
