## Context

The non-native agent shell redacts signal payloads in local `sent` and `received` runtime events. Signal messages are currently signaling metadata only, but future native media adapters will depend on strict peer routing boundaries before processing any remote transport data.

The development relay already validates sender and recipient routing for registered peers. The managed agent-shell runtime should still fail closed when exercised against tests, tools, or unexpected relay-like endpoints that inject same-session signal envelopes.

## Goals / Non-Goals

**Goals:**

- Ignore decoded inbound `signal` messages whose `toPeerId` does not match the local runtime `peerId`.
- Ignore decoded inbound `signal` messages whose `fromPeerId` equals the local runtime `peerId`.
- Run these checks before local `received` protocol event emission or received signal summary logging.
- Keep ignored-message diagnostics secret-safe by exposing only redacted summary metadata such as byte length.
- Preserve normal remote-to-local signal events from distinct peers.

**Non-Goals:**

- No protocol schema, relay behavior, production identity, token lifecycle, WebRTC/media transport, capture, input, clipboard, file transfer, installer, service, startup, privilege, or native Windows behavior changes.
- No change to relay-side signal validation.

## Decisions

- Add a local inbound signal peer-boundary guard after protocol decoding and session matching, before received-event emission.
  - Rationale: the signal route can be inspected only after decoding, and the guard must run before local signal metadata is surfaced.
  - Alternative considered: rely only on relay forwarding. Rejected because the runtime should fail closed against unexpected relay-like sources.
- Reuse the unsafe inbound protocol redaction path.
  - Rationale: ignored signaling input should not expose message type, peer ids, session ids, payload keys, tokens, or payload fragments in local raw events/logs.
  - Alternative considered: log a specific signal routing mismatch. Rejected because generic byte-length diagnostics are enough and safer.

## Risks / Trade-offs

- A misconfigured peer route will not be visible as a received signal event. -> Mitigation: fail-closed routing is required before future media adapters can safely consume signaling metadata.
- Generic ignored-message diagnostics reduce routing debug detail. -> Mitigation: byte length remains available without exposing signal payload or identifiers.
