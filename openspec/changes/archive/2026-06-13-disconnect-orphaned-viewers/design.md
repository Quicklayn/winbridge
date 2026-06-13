## Context

Relay pairing is host-created: the host join creates an in-memory pairing ticket, and viewer join consumes it. Current room cleanup removes only the disconnected peer. That leaves a stale viewer in room membership after host disconnect, so a replacement host can join the same session while the viewer remains a registered recipient without consuming the replacement host's new pairing credential.

The development relay has only two-party rooms. There is no reconnect protocol or durable pairing scope in the current product.

## Goals / Non-Goals

**Goals:**

- Ensure host disconnect ends the current two-party pairing scope.
- Ensure a replacement host starts with room size 1 and a fresh pairing ticket.
- Ensure the old viewer cannot forward to, receive from, or count as paired with the replacement host unless it reconnects and consumes the new pairing credential.
- Keep disconnect and rejection audit metadata bounded and secret-safe.

**Non-Goals:**

- No automatic reconnect or session migration.
- No change to viewer disconnect behavior when the host remains registered.
- No native capture, input, installer, service, persistence, or privilege-elevation behavior.

## Decisions

1. Close remaining viewer sockets when the host disconnects.

   Rationale: leaving them connected but unregistered creates ambiguous runtime behavior and forces every caller to understand a half-open state. Closing is fail-closed and matches the absence of reconnect semantics.

   Alternative considered: keep the viewer socket open and require it to rejoin. That would need a new protocol state transition and is broader than this safety fix.

2. Add a membership check before forwarding registered-peer messages.

   Rationale: socket close delivery is asynchronous. A stale socket must fail closed even if it sends after the room removed it but before the transport closes.

   Alternative considered: rely only on closing the stale socket. That leaves a race window and makes correctness depend on WebSocket timing.

3. Use bounded relay-defined metadata and close reasons.

   Rationale: disconnect cleanup is a relay lifecycle event and must not echo pairing codes, tokens, close reasons, protocol payloads, private reasons, or remote content.

## Risks / Trade-offs

- [Risk] Existing raw clients may expect a viewer to remain connected after host disconnect. -> Mitigation: the existing product has no reconnect semantics; requiring a fresh viewer join preserves explicit pairing scope.
- [Risk] Closing the viewer after sending `peer-disconnected` may produce duplicate cleanup paths. -> Mitigation: room cleanup must be idempotent and membership checks must reject already-removed peers.
