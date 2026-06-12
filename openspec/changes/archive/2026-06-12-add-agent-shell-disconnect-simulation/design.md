## Context

The agent shell is the current non-native workflow exerciser. It can approve, deny, revoke, pause, resume, terminate, and expire simulated authorizations, and the relay emits `peer-disconnected` when a registered peer's transport closes. Manual CLI interruption already calls `runtime.stop()`, but there is no deterministic workflow option that closes the host connection after visible activation.

## Goals / Non-Goals

**Goals:**

- Add a deterministic host disconnect simulation that can be configured with a bounded delay.
- Require explicit approval plus active visible state before the delayed disconnect can fire.
- Close the host transport directly instead of sending a peer-originated disconnect protocol message.
- Ensure later delayed revoke, pause, resume, terminate, expiration, authorization state, session control, permission revoke, and workflow audit-event messages do not send after local disconnect.
- Keep close/error diagnostics secret-safe.

**Non-Goals:**

- No native Windows UI, tray indicator, screen capture, input injection, clipboard sync, file transfer, installer, service, startup, privilege elevation, unattended access, evasion, credential access, keylogging, or prompt bypass.
- No production account session management or reconnect policy.
- No new protocol message type; relay-originated `peer-disconnected` remains the disconnect notification.

## Decisions

1. **Close the WebSocket from the host runtime.**
   - Rationale: The relay already owns disconnect observation and notification. Sending `peer-disconnected` from the host would violate relay authority.
   - Alternative considered: Send a workflow `session-control` terminate. That already exists and does not test the transport disconnect path.

2. **Schedule only after visible activation.**
   - Rationale: A disconnect control matters for a live visible session. Scheduling before visible activation could make consent failure paths harder to reason about and does not model a granted session disconnect.

3. **Use existing timer validation.**
   - Rationale: The new delay has the same safety constraints as revoke, pause, resume, terminate, and authorization TTL.

4. **Mark connection scoped state closed before transport close.**
   - Rationale: If caller code re-enters during close handling, the runtime should fail closed before socket writes and before later delayed workflows can send.

## Risks / Trade-offs

- **Risk: Disconnect racing with other delayed lifecycle timers.** Mitigation: use the same scheduler checks and mark local disconnect state before closing the socket, causing later delayed sends to skip or fail closed.
- **Risk: Raw close reasons leak.** Mitigation: use a fixed bounded close reason and existing closed-event redaction; tests assert raw private data is not exposed.
- **Risk: Viewer treats disconnect as authorization.** Mitigation: existing peer-disconnect state handling states that disconnect is not authorization and blocks sends after remote disconnect.
