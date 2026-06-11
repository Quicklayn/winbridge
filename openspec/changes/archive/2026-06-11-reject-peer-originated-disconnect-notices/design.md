## Context

The relay creates `peer-disconnected` notifications in its WebSocket close handler and sends them to remaining peers. The same message type is also present in the protocol union so clients can parse it safely.

After registration, the relay forwards schema-valid protocol messages from peers to the other side. This is appropriate for signaling and consent workflow messages, but disconnect notification authority belongs to the relay because it represents transport lifecycle observed by the broker.

## Goals / Non-Goals

**Goals:**

- Reject peer-originated `peer-disconnected` messages before forwarding.
- Preserve relay-originated disconnect notifications from the close handler.
- Keep rejection audit details secret-safe and payload-free.
- Add integration tests for forged disconnect attempts.

**Non-Goals:**

- Change protocol schema, reconnect semantics, production identity, multi-viewer rooms, native UI, capture/input, clipboard, file transfer, installer/service behavior, startup persistence, credential access, privilege elevation, hidden sessions, or Windows prompt bypass.

## Decisions

1. Enforce the rule in the relay forwarding path.
   - Rationale: only the relay can distinguish broker-observed disconnect lifecycle from peer-supplied envelopes in this architecture.
   - Alternative considered: make clients ignore peer-disconnected unless separately authenticated. Rejected for the current development relay because clients only see messages through the relay, and broker-side rejection provides a single enforcement point.

2. Use the existing message rejection/audit path.
   - Rationale: forged disconnect notices are invalid peer messages, not a new capability. The existing path rate-limits repeated invalid messages and avoids raw payload logging.
   - Alternative considered: silently drop forged messages. Rejected because security-relevant denial should be auditable.

## Risks / Trade-offs

- [Risk] Future peer-to-peer transports may need signed lifecycle messages. -> Mitigation: this change is scoped to the development relay; future transports require separate OpenSpec changes.
- [Risk] Existing tests might treat any protocol union message as forwardable. -> Mitigation: relay-runtime specs now distinguish peer-forwardable messages from relay-originated lifecycle events.
