## Context

`sendProtocol` validates outbound envelopes, writes the encoded message to the WebSocket, and then emits a local redacted `sent` runtime event. That event is local diagnostic observability; it is not the transport write, authorization gate, audit persistence gate, signal authorization gate, or host visibility surface.

The current direct `onEvent` call can throw after the socket write has already happened. For workflow-generated messages this can look like a runtime failure even though the message was sent; for public sends it can make caller code observe a diagnostic callback failure as if the send itself was rejected.

## Goals / Non-Goals

**Goals:**

- Contain local `sent` runtime event callback failures after successful WebSocket writes.
- Preserve all pre-send validation: malformed, cross-session, unauthorized, disconnected, unsafe, workflow-authority, or signal-gated public sends remain blocked before socket write and before local `sent` event emission.
- Preserve redaction of `sent` event payloads, including pairing codes, protocol reasons, audit details, and signal payload contents.
- Add focused regression coverage for workflow-originated sends and public authorized signal sends.

**Non-Goals:**

- No change to host indicator event callback behavior; host indicator emission remains the authoritative local visibility surface.
- No change to socket write errors, protocol encoding, public send validation, audit persistence, consent decisions, host visibility activation, signal authorization, relay forwarding, or protocol schemas.
- No capture, input, clipboard, file transfer, diagnostics content transfer, reconnect, installer, startup persistence, service, privilege elevation, token format, native Windows API, hidden session, stealth behavior, credential access, keylogging, AV/EDR evasion, Windows prompt bypass, or consent bypass.

## Decisions

- Reuse `emitRuntimeEventBestEffort` for `sent` runtime event emission.
  - Rationale: the helper already provides local observer exception containment and preserves synchronous event delivery for normal observers and reentrant test paths.
  - Alternative considered: create a dedicated `emitSentRuntimeEventBestEffort`. That would duplicate the same boundary without additional safety value.
- Keep `socket.send(encodeProtocolEnvelope(normalizedMessage))` before the event callback.
  - Rationale: the change is only about post-send diagnostics. Transport write failures should remain visible to the caller or workflow path rather than being hidden as observer failures.
- Do not change blocked-send behavior.
  - Rationale: public send gates are security boundaries. Blocked sends must continue to fail before socket write and before `sent` event emission.

## Risks / Trade-offs

- A broken local observer can miss a `sent` event. -> The protocol message has already been validated and written; tests assert core workflow/signal outcomes still proceed and redacted event text does not leak callback errors.
- Containment could hide bugs in local diagnostic observers. -> The catch is limited to runtime event callbacks and does not apply to socket write, host indicator visibility emission, consent providers, audit persistence, or pre-send authorization gates.
