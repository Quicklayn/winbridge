## Context

The non-native agent shell sends `hello` only after the relay reports a paired room or after receiving a peer `hello`. The message is presence metadata only, but it gates later workflow ordering and should still be bound to a distinct remote peer.

The relay normally forwards `hello` from the other socket in a two-party room. The managed runtime can also be exercised by tests, tools, or unexpected relay-like endpoints, so it should ignore self-referential `hello` messages locally.

## Goals / Non-Goals

**Goals:**

- Ignore decoded inbound `hello` messages whose `peerId` equals the local runtime `peerId`.
- Run the check before local `received` protocol event emission, receive logging, or `sendHelloOnce` presence handling.
- Keep ignored-message diagnostics secret-safe by exposing only redacted summary metadata such as byte length.
- Preserve normal `hello` exchange behavior for messages from a distinct peer.

**Non-Goals:**

- No protocol schema, relay behavior, production identity, token lifecycle, capture, input, clipboard, file transfer, installer, service, startup, privilege, or native Windows behavior changes.
- No change to authorization grants or visible session activation.

## Decisions

- Add a local self-hello guard after protocol decoding and session matching, before received-event emission.
  - Rationale: `hello.peerId` is available only after decoding, and the guard must run before presence workflow side effects.
  - Alternative considered: rely only on relay forwarding. Rejected because the agent-shell runtime should fail closed when used against unexpected relay-like sources.
- Reuse the unsafe inbound protocol redaction path.
  - Rationale: ignored presence metadata should not expose message type, peer ids, session ids, display names, capability strings, tokens, or payload fragments in local raw events/logs.
  - Alternative considered: log a specific self-hello diagnostic. Rejected because generic byte-length metadata is enough for local troubleshooting.

## Risks / Trade-offs

- A misconfigured peer using the same peer id will not trigger the hello exchange. -> Mitigation: distinct peer ids are required for a meaningful two-party session, and failing closed preserves consent boundaries.
- Generic ignored-message diagnostics provide less debugging detail. -> Mitigation: byte length remains available while avoiding metadata leakage.
