## Context

`apps/agent-shell` is a non-native protocol exerciser. It does not capture screens, inject input, sync clipboard, transfer files, or run as a background service. Its public `send()` method is still a local boundary future callers can use for low-level protocol envelopes.

Relay-side authority checks reject registered peers that replay `join-session`, forge relay-originated lifecycle messages, spoof `hello.peerId`, send a role-mismatched `hello`, or send viewer-originated request messages from a non-viewer role. The public runtime should enforce the same boundary before `sendProtocol()` writes to the socket or emits local `sent` events.

## Goals / Non-Goals

**Goals:**

- Reject public sends for `join-session`, `relay-ready`, and `peer-disconnected`.
- Require public `hello.peerId` and `hello.role` to match the runtime's local peer id and role.
- Require public `host-consent-required.viewerPeerId` and `session-authorization-request.viewerPeerId` to match the local peer id and require the local runtime role to be `viewer`.
- Run the guard after the session guard and before workflow, signal, socket, and local `sent` event handling.
- Keep thrown errors generic and avoid exposing protocol payloads, session ids, peer ids, roles, display names, permission scopes, tokens, pairing codes, private reasons, signal payloads, screen contents, or input contents.

**Non-Goals:**

- Do not block same-session public legacy host-consent request sends when the local runtime is the viewer; they remain non-granting request messages.
- Do not change internal join, hello, or authorization request sends created by the runtime itself.
- Do not change relay forwarding rules or protocol schemas.
- Do not add capture, input, clipboard, file transfer, WebRTC, native Windows UI, services, startup persistence, credential access, stealth behavior, or production identity.

## Decisions

1. **Add a public-send authority guard in `AgentShellRuntime.send()`.**
   - The public send path is where caller-provided envelopes enter the managed runtime.
   - Running after session binding preserves the earlier cross-session failure boundary.
   - Running before `sendProtocol()` prevents socket writes and local `sent` events for rejected messages.
   - Alternative considered: rely only on relay rejection. Rejected because local observers could still treat rejected output as accepted by watching `sent` events.

2. **Block relay-owned lifecycle and join-only messages publicly.**
   - `join-session` is internally emitted at startup and includes the pairing credential on the wire.
   - `relay-ready` and `peer-disconnected` are relay-originated lifecycle messages.
   - Public caller code should not be able to make these appear as accepted local output.

3. **Bind public presence and request messages to local identity.**
   - `hello` is presence metadata and must represent the local runtime peer and role.
   - `host-consent-required` and `session-authorization-request` are viewer-originated request messages and must not be sent by a host runtime or on behalf of another viewer.

## Risks / Trade-offs

- [Risk] Some low-level tests may have used `AgentShellRuntime.send()` to exercise relay rejection for join or spoofed actor messages.
  Mitigation: use raw WebSocket tests for relay rejection behavior; the managed runtime should remain fail-closed.
- [Risk] The public send API becomes narrower.
  Mitigation: narrowing only removes messages that are relay-owned, join-only, spoofed, or role-mismatched; valid same-session viewer requests and authorized signals remain available.
