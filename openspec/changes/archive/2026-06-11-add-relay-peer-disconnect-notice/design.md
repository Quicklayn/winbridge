## Context

The development relay currently registers host/viewer peers, forwards validated protocol envelopes, removes disconnected peers from rooms, and writes a `relay.peer.disconnect` audit event. The remaining peer is left to infer the disconnect from transport behavior or future client-local timers.

WinBridge requires host-visible, consent-first session control. Immediate disconnect visibility supports that requirement: when the host leaves, the viewer must stop treating the session as active; when the viewer leaves, the host must stop waiting for remote assistance state. This change stays within the current TypeScript bootstrap scope and does not add capture, input, persistence, or Windows-native behavior.

## Goals / Non-Goals

**Goals:**

- Add a schema-valid `peer-disconnected` protocol envelope.
- Notify remaining peers in the same relay room when a registered host or viewer disconnects.
- Keep notification and audit metadata secret-safe, bounded, and free of raw close reasons, pairing codes, tokens, payloads, screen content, or input content.
- Cover the behavior with focused protocol and relay integration tests.

**Non-Goals:**

- Reconnect policy, multi-viewer semantics, native Windows UI, screen capture, input injection, clipboard sync, file transfer, installer behavior, startup behavior, services, credential access, privilege elevation, hidden sessions, or Windows security prompt bypass.
- Production identity or authorization changes. The existing development relay token and pairing gates remain development-only controls.

## Decisions

1. Add `peer-disconnected` as a protocol envelope, not an untyped relay error.
   - Rationale: agents and future UI clients can validate the event through the same protocol parser used for other trusted session lifecycle messages.
   - Alternative considered: send a raw JSON relay event outside the protocol union. Rejected because it would bypass schema validation and duplicate message handling paths.

2. Use bounded relay reason codes instead of forwarding WebSocket close reasons.
   - Rationale: close reasons can contain client-controlled or environment-derived text. A fixed `reasonCode` avoids leaking secrets into peers or audit logs.
   - Alternative considered: include `closeCode` and `closeReason`. Rejected for this increment because it increases information exposure without a concrete client requirement.

3. Notify peers after identifying remaining room members and before writing the disconnect audit record.
   - Rationale: the audit can include whether notification was attempted and how many remaining peers were targeted. Peers are selected before removal so the disconnecting peer is excluded explicitly while the other side is still addressable.
   - Alternative considered: remove the peer first, then query the room. That is simpler but risks losing room context if the room is deleted when the first peer leaves.

4. Treat disconnect notification as session lifecycle state only.
   - Rationale: the message must never grant permissions, start capture, send input, reconnect, or override authorization state. Clients must still use existing consent and authorization messages for sensitive actions.
   - Alternative considered: attach permission or reconnect instructions. Rejected as out of scope and higher risk.

## Risks / Trade-offs

- [Risk] A remaining socket may close while the relay attempts to notify it. -> Mitigation: notification is best-effort and the relay records only safe count metadata; the remaining peer's own close path is still audited independently.
- [Risk] Clients could misinterpret disconnect as authorization state. -> Mitigation: the schema carries only peer id, role, and reason code; tests and specs state it grants no permissions and starts no remote action.
- [Risk] Heartbeat termination also flows through the WebSocket close handler. -> Mitigation: this increment uses the generic safe `peer-closed` reason code; heartbeat timeout remains separately audited by the existing heartbeat event.
- [Risk] Future multi-viewer rooms may need richer semantics. -> Mitigation: current room spec remains explicitly two-party until a future OpenSpec change introduces multi-viewer behavior.
