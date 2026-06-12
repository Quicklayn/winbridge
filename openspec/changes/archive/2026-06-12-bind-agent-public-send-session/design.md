## Context

`apps/agent-shell` is a non-native protocol exerciser. It does not capture screens, inject input, sync clipboard, transfer files, or run as a background service. Its public `send()` method is still a local boundary future callers can use for low-level protocol envelopes.

The inbound path already checks decoded `sessionId` before local `received` events or workflow handling. Relay-side session membership also rejects cross-session messages from registered peers. The public runtime send path should enforce the same local session boundary before `sendProtocol()` emits a redacted but still accepted-looking `sent` event.

## Goals / Non-Goals

**Goals:**

- Reject public runtime sends whose `message.sessionId` does not equal `options.sessionId`.
- Run the guard before socket write and before local `sent` event emission.
- Run the guard before other public-send checks so cross-session workflow or signal messages fail for the session boundary first.
- Keep thrown errors generic and avoid exposing protocol payloads, session ids, peer ids, tokens, pairing codes, private reasons, signal payloads, screen contents, or input contents.

**Non-Goals:**

- Do not change internal workflow sends created by the runtime itself; they already use `createMessageBase(options.sessionId)`.
- Do not change relay forwarding rules or protocol schemas.
- Do not add capture, input, clipboard, file transfer, WebRTC, native Windows UI, services, startup persistence, credential access, stealth behavior, or production identity.

## Decisions

1. **Add the guard in `AgentShellRuntime.send()`.**
   - The public send path is where caller-provided envelopes enter the managed runtime.
   - The check can compare the already-decoded `ProtocolEnvelope.sessionId` against the runtime option without parsing raw data.
   - Alternative considered: rely on relay rejection. Rejected because local `sent` events would still make rejected cross-session output look accepted to local observers.

2. **Use one generic session-routing error.**
   - A fixed error string avoids leaking the wrong session id, message type, peer ids, signal payload keys, private reasons, or payload fragments.
   - Existing error/log sanitization uses message byte counts only when errors surface through async handlers.

3. **Do not narrow the guard to `signal`.**
   - Non-signal public messages can still expose local `sent` events, requested permission metadata, display names, or workflow-looking output for the wrong session.
   - The local runtime session boundary should apply to every public-send envelope.

## Risks / Trade-offs

- [Risk] Tests or callers that intentionally exercise relay cross-session rejection through `AgentShellRuntime.send()` will now fail earlier.
  Mitigation: use raw WebSocket tests for relay rejection behavior; the managed runtime should remain fail-closed.
- [Risk] Public workflow-authority sends with wrong sessions now report the session-boundary error rather than the workflow-authority error.
  Mitigation: same-session workflow-authority sends remain covered by the workflow-authority gate, and wrong-session messages are rejected at the earlier boundary.
