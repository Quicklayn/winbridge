## Context

The agent shell emits local runtime events after sending protocol messages. Current `sent` events redact join-session pairing codes, audit-event sensitive details, and inbound signal payloads are now redacted from `received` events. Outbound `sent` events for `signal` messages still include the raw `payload` object.

Signal payloads can contain SDP, ICE candidates, diagnostics, and future transport metadata. They are useful on the wire but are not required for local consent workflow observability. Keeping them out of local events reduces accidental persistence and display risk.

## Goals / Non-Goals

**Goals:**

- Prevent local `sent` runtime events from exposing raw `signal.payload` contents.
- Preserve message identity and peer routing metadata so tests can still observe outbound signal sends.
- Preserve safe diagnostics with payload byte length.
- Keep protocol validation, socket send behavior, and relay forwarding unchanged.

**Non-Goals:**

- No changes to protocol schema acceptance for `signal` messages.
- No changes to relay forwarding, authorization state, consent workflow, or audit-event schema redaction.
- No native capture/input, WebRTC implementation, reconnect, installer, service, startup, or privilege work.

## Decisions

1. Redact only local sent-event signal payloads.

   The runtime will validate and send the original normalized signal message, but `onEvent` will receive a redacted event view. This preserves wire behavior while making local diagnostics secret-safe.

   Alternative considered: reject signal payloads from agent shell sends. Rejected because the relay/protocol already define allowed signal payloads and this change is about local event exposure, not protocol semantics.

2. Reuse one signal payload summary shape for sent and received events.

   Both event directions will represent redacted signal payloads as a non-empty object with the redaction marker and original byte length.

   Alternative considered: make sent events omit payload entirely. Rejected because event consumers can still benefit from knowing payload size without content.

3. Keep consent-state fields unredacted.

   Only `signal.payload` is redacted in this change. Authorization decisions, state, permissions, bounded reason codes, and peer-disconnect metadata remain visible to tests because they are semantic consent workflow state.

## Risks / Trade-offs

- Consumers that relied on raw outbound signal payloads in local events lose that data -> intentional; event consumers should not persist transport payloads.
- Byte length can reveal approximate payload size -> acceptable because it does not expose SDP, candidates, tokens, credentials, keystrokes, screenshots, screen contents, or input contents.
- Future event views could diverge -> a shared signal payload summary helper will keep sent and received behavior consistent.
