## Context

The relay heartbeat already terminates stale peers and emits a secret-safe `relay.peer.heartbeat.timeout` audit event. The normal WebSocket close cleanup then removes the peer and notifies any remaining peer using `peer-disconnected` with the generic `peer-closed` reason.

## Goals / Non-Goals

**Goals:**

- Preserve the existing heartbeat timeout termination and room cleanup path.
- Mark the subsequent broker-observed disconnect notice and disconnect audit with bounded reason code `heartbeat-timeout`.
- Keep peer-facing and audit metadata secret-safe.

**Non-Goals:**

- No automatic reconnect, retry, or session recovery.
- No new authorization, capture, input, clipboard, file-transfer, diagnostics, installer, startup, service, token, or privilege behavior.
- No raw WebSocket close reason, exception message, token, pairing code, payload, screen, input, or credential data in protocol or audit output.

## Decisions

- Track heartbeat timeout as connection-local state before terminating the stale socket.
  This keeps the normal close cleanup authoritative for room removal and notification while letting it choose the bounded reason code.

- Extend the shared `PeerDisconnectedReasonCodeSchema`.
  The reason is protocol-visible, so the schema must accept both existing `peer-closed` and the new `heartbeat-timeout` value.

- Keep audit details bounded.
  Disconnect audit should continue to report counts and role metadata, using the bounded `reasonCode` value only.

## Risks / Trade-offs

- More specific reason codes can become part of client logic.
  Mitigation: restrict the value to a small enum and test that it does not alter authorization or reconnect behavior.

- Heartbeat termination ordering may vary by WebSocket implementation.
  Mitigation: set the timeout flag before `terminate()` and rely on the existing close cleanup path.
