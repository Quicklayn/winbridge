## Why

The relay currently removes and audits disconnected peers, but the remaining peer does not receive a schema-valid protocol notification. Future host/viewer clients need an immediate disconnect signal so viewer UX can stop session state when the host disconnects and host UX can stop waiting when the viewer leaves.

## What Changes

- Add a protocol `peer-disconnected` message carrying the disconnected peer id, role, and a safe reason code.
- Send `peer-disconnected` from the relay to remaining room peers when a registered peer disconnects.
- Keep relay disconnect audit events secret-safe and include notification target, sent, and failure count metadata.
- Ensure disconnect notifications do not grant permissions, start capture, send input, reconnect, or bypass authorization.
- Add focused protocol and relay integration tests for host and viewer disconnect notification behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-broker`: Adds peer disconnect notification semantics for brokered development sessions.
- `relay-runtime`: Adds testable relay behavior for notifying remaining peers when a registered peer disconnects.

## Impact

- Affected code: `packages/protocol`, `apps/relay`, docs, and focused tests.
- API impact: protocol envelope union gains `peer-disconnected`.
- Safety impact: strengthens immediate host/viewer disconnect visibility without adding remote action capability.
- Touches relay, networking/session lifecycle, and audit/log metadata; requires security review.
- Non-goals: reconnect policy, multi-viewer semantics, screen capture, input injection, clipboard sync, file transfer, installer behavior, startup behavior, service registration, credential access, privilege elevation, hidden access, or Windows security prompt bypass.
