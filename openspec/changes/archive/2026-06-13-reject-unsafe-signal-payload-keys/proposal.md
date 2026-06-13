## Why

`signal.payload` is the development path for future WebRTC signaling. It already rejects non-JSON values, missing or malformed `authorizationId`, oversized payloads, and sensitive remote-assistance content keys. However, extensible payload property names can still contain ASCII control characters or Unicode bidi/zero-width formatting controls. Those keys can make signaling metadata visually ambiguous and can complicate future adapter parsing.

## What Changes

- Reject ASCII control characters in `signal.payload` property names before parsing, encoding, forwarding, trusted agent events, or public sends.
- Reject Unicode bidirectional and zero-width formatting controls, including `U+FEFF`, in `signal.payload` property names.
- Apply validation recursively to nested signal payload objects and objects inside arrays.
- Keep diagnostics bounded and free of raw payload key/value text.
- Add focused protocol, relay, and agent-shell regression tests plus docs/spec updates.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-broker`: Signal payload metadata keys must be JSON-safe and visually unambiguous before forwarding.
- `relay-runtime`: Registered malformed `signal` payload keys are rejected before forwarding without raw key leakage.
- `agent-shell-consent-workflow`: Inbound and public-send malformed signal payload keys fail closed before trusted local events or socket writes.

## Impact

- Affected code: `packages/protocol/src/messages.ts`.
- Affected tests: `packages/protocol/src/messages.test.ts`, `apps/relay/src/server.integration.test.ts`, `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: session broker, relay runtime, agent-shell consent workflow, architecture/security docs.
- Security surface: signaling metadata, relay forwarding, agent-shell event/log safety.
- Non-goals: no capture, input, clipboard, file transfer, installer, startup, service, privilege elevation, persistence, reconnect, or production auth changes.
