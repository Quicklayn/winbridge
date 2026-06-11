## Context

The relay currently accepts host and viewer joins by storing the raw pairing code on each `RelayPeer` and comparing the strings after room insertion. The protocol package already provides `PairingTicket` helpers that hash pairing codes, track expiration, and consume remaining uses, but the relay does not use them.

This change keeps the relay as a development relay. It improves the local/private bootstrap by reducing raw secret retention and proving expiration and one-use pairing behavior before production identity storage exists.

## Goals / Non-Goals

**Goals:**

- Create an in-memory pairing ticket when a host joins a room.
- Store pairing-code hashes, expiration, and remaining uses in relay room state.
- Require the host to be present before viewer pairing can be consumed.
- Reject mismatched, expired, missing, or already-consumed pairing tickets before viewer registration.
- Emit audit details with safe booleans/counts/status metadata only.
- Keep pairing separate from session authorization and remote action permission grants.

**Non-Goals:**

- No production account authentication, MFA, durable device database, or distributed pairing store.
- No reconnect policy for consumed development tickets.
- No screen capture, input injection, clipboard, file transfer, installer, service, startup, privilege, or persistence behavior.
- No hidden/unattended session semantics.

## Decisions

1. **Move pairing lifecycle into `RoomRegistry`.**
   - Rationale: Room state already owns per-session host/viewer membership and is the narrowest place to ensure the viewer cannot register without consuming the host-created ticket.
   - Alternative considered: Keep raw code comparison in `server.ts`. That would preserve raw secret retention and duplicate protocol pairing helpers.

2. **Host creates, viewer consumes.**
   - Rationale: The Windows assistance flow begins with the host exposing pairing material to a viewer. Requiring the host first makes ticket creation explicit and prevents viewer-first rooms from holding raw secrets.
   - Alternative considered: Let viewer create a pending ticket before host arrival. That would invert the consent-oriented pairing flow and store a viewer-provided secret before host participation.

3. **Use single-process development config for TTL and uses.**
   - Rationale: The current relay is single-process and test-focused. Runtime options and environment variables are enough to exercise expiration and consumption behavior locally.
   - Alternative considered: Add durable pairing storage now. That belongs with future production identity/auth work and would be premature for this bootstrap relay.

4. **Audit only safe pairing metadata.**
   - Rationale: Denied joins are security-relevant, but audit details must not leak raw pairing codes. Details can include whether a ticket existed, whether it was consumed, remaining use counts, TTL settings, and reason codes.
   - Alternative considered: Audit hashes for debugging. Even hashed pairing codes are unnecessary in relay audit output and can create correlation risk.

## Risks / Trade-offs

- **Risk: Viewer reconnect after one-use consumption is rejected.** -> Mitigation: Document this as development behavior; future reconnect semantics require a separate OpenSpec change.
- **Risk: Host-first requirement changes ad-hoc local usage.** -> Mitigation: README examples already start host before viewer; tests cover viewer-first rejection.
- **Risk: Audit reason text could leak secrets.** -> Mitigation: Use fixed error messages and safe detail fields; tests assert raw pairing codes are absent.
- **Risk: Local device identity may be absent in older tests/tools.** -> Mitigation: Derive a development-only fallback device id from peer id without treating it as production authentication.
