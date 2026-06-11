## Context

The agent shell emits local runtime events for tests and callers after decoding inbound protocol messages. Logs already summarize received messages, and workflow audit sinks do not persist arbitrary inbound protocol payloads. However, a `received` event for a `signal` message still carries the raw `payload` object.

Signal payloads are not remote actions, but they are transport diagnostics and may contain SDP, ICE candidates, host or network metadata, or future implementation details. Local event consumers should not need raw signal contents to enforce consent workflow behavior.

## Goals / Non-Goals

**Goals:**

- Prevent local `received` runtime events from exposing raw `signal.payload` contents.
- Preserve message identity and routing metadata so tests can still observe signal delivery.
- Preserve safe diagnostics with payload byte length.
- Keep wire protocol decode, relay validation, relay forwarding, and runtime workflow behavior unchanged.

**Non-Goals:**

- No changes to relay forwarding or protocol schema acceptance for `signal` messages.
- No redaction of semantic consent-state fields such as authorization status, permissions, or bounded reason codes.
- No native capture/input, WebRTC implementation, reconnect, installer, service, startup, or privilege work.

## Decisions

1. Redact only local received-event signal payloads.

   The runtime will pass the original decoded message to internal workflow handlers and logs, but `onEvent` will receive a redacted event view for `signal` messages. The event remains recognizable as `type: "signal"` with peer routing fields intact.

   Alternative considered: redact all received protocol messages. Rejected because consent workflow tests and future UI adapters need semantic authorization state fields.

2. Use a schema-compatible payload summary.

   The redacted payload will remain a non-empty object, for example `{ redacted: "[REDACTED]", byteLength: <number> }`. This keeps the event structurally close to a protocol signal without exposing raw content.

   Alternative considered: replace payload with a string. Rejected because it would no longer match the signal payload shape used across the protocol.

3. Measure the original payload at the event boundary.

   Byte length will be computed from the JSON representation of the decoded payload. This is safe diagnostic metadata and avoids retaining content or hashes.

## Risks / Trade-offs

- Consumers that relied on raw signal payloads in local events will lose that data -> intentional; event consumers should use protocol-level handlers for transport work instead of diagnostic event capture.
- Byte length can reveal approximate payload size -> acceptable because it does not expose SDP, candidates, tokens, credentials, keystrokes, screenshots, screen contents, or input contents.
- Internal workflow still sees the original decoded signal -> current agent shell does not act on signal payloads; the redaction boundary is specifically local event emission.
