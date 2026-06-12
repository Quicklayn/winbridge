## Why

Heartbeat timeouts are currently audited, but remaining peers only see the generic `peer-closed` disconnect reason. A bounded `heartbeat-timeout` reason lets host/viewer workflows and future UI distinguish stale transport loss from an ordinary close without exposing raw close data or changing authorization.

## What Changes

- Add `heartbeat-timeout` as a bounded relay-originated peer disconnect reason code.
- Send `heartbeat-timeout` in the `peer-disconnected` notice and disconnect audit metadata when relay heartbeat termination caused the close.
- Add relay integration coverage proving the remaining peer receives the bounded timeout reason and no sensitive close material.
- Non-goals: no reconnect behavior, no hidden sessions, no capture/input changes, no Windows native API work, no installer/startup/service changes, no token or pairing material exposure.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `relay-heartbeat`: heartbeat timeout cleanup reports a bounded timeout disconnect reason.
- `session-broker`: peer disconnect notices may carry the bounded `heartbeat-timeout` reason code.
- `relay-runtime`: integration tests verify heartbeat timeout disconnect notices and audit metadata.

## Impact

- Affected code: `packages/protocol/src/messages.ts`, relay server heartbeat/disconnect handling, relay integration tests.
- Affected behavior: remaining peers receive a more specific bounded disconnect reason after heartbeat timeout.
- Safety impact: preserves fail-closed disconnect behavior and improves auditability without granting permissions, reconnecting peers, suppressing host visibility, or exposing raw close reasons, tokens, pairing codes, protocol payloads, credentials, screen data, or input contents.
