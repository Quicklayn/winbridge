## Context

`apps/agent-shell` is a non-native protocol exerciser. It does not capture screens, inject input, sync clipboard, transfer files, or run as a background service. Its public `send()` method is still a local boundary future callers can use for low-level protocol envelopes.

The relay already rejects registered-peer sends when no remaining recipient is available. The managed runtime also defers internally generated `hello` and viewer authorization requests until it sees paired room evidence. The public send path should enforce the same local boundary before `sendProtocol()` writes to the socket or emits local `sent` events.

## Goals / Non-Goals

**Goals:**

- Record recipient availability only after an accepted inbound `relay-ready` with `roomSize >= 2` or an accepted inbound peer `hello`.
- Reset recipient availability on connection lifecycle reset and after a trusted remote `peer-disconnected` notice.
- Reject public `hello`, `host-consent-required`, `session-authorization-request`, and authorized `signal` sends when no recipient peer has been observed.
- Run the guard after session, public authority, workflow-authority, signal routing, and signal authorization checks so existing failure precedence stays stable, and before `sendProtocol()` so blocked messages do not write to the socket or emit `sent`.
- Keep thrown errors generic and avoid exposing protocol payloads, session ids, peer ids, display names, permission scopes, tokens, pairing codes, private reasons, signal payloads, screen contents, or input contents.

**Non-Goals:**

- Do not change internal join, hello, or authorization request sends created by the runtime itself.
- Do not make unpaired public sends enqueue or replay after a recipient appears.
- Do not change relay forwarding rules or protocol schemas.
- Do not add capture, input, clipboard, file transfer, WebRTC, native Windows UI, services, startup persistence, credential access, stealth behavior, or production identity.

## Decisions

1. **Store recipient evidence in connection-scoped session state.**
   - `relay-ready.roomSize >= 2` and inbound peer `hello` are already the only inputs that trigger internal presence-dependent workflow.
   - Keeping the state connection-scoped avoids carrying old pairing evidence across reconnects.

2. **Guard public peer messages before local output.**
   - The public send path is where caller-provided envelopes enter the managed runtime.
   - Running before `sendProtocol()` prevents socket writes and local `sent` events for rejected messages.
   - Alternative considered: rely only on relay rejection. Rejected because local observers could still treat rejected output as accepted by watching `sent` events.

3. **Keep existing failure precedence.**
   - Cross-session, relay-owned, spoofed, role-mismatched, and workflow-authority sends should continue to fail with their specific generic errors.
   - The recipient guard only applies after those checks pass.

## Risks / Trade-offs

- [Risk] Some low-level tests may use `send()` before pairing to exercise relay rejection.
  Mitigation: use raw WebSocket relay tests for relay behavior; the managed runtime should fail closed locally.
- [Risk] The public send API becomes narrower.
  Mitigation: narrowing only removes pre-recipient peer sends; paired same-viewer requests and authorized signals remain available.
