## Context

The non-native agent shell sends `join-session` first and waits for a relay-provided `relay-ready` message before treating the room as paired. When `roomSize >= 2`, the runtime sends `hello` and a viewer may send a `session-authorization-request`.

The development relay sends `relay-ready.peerId` for the registered socket's local peer id. The agent shell should verify that local peer binding before using the message as a workflow trigger, because tests, tools, or unexpected relay-like endpoints can feed valid same-session envelopes directly into the managed runtime.

## Goals / Non-Goals

**Goals:**

- Ignore decoded inbound `relay-ready` messages whose `peerId` does not match the local runtime `peerId`.
- Run the check before local `received` protocol event emission, receive logging, `hello` sends, or viewer authorization request sends.
- Keep ignored-message diagnostics secret-safe by exposing only redacted summary metadata such as byte length.
- Preserve normal `relay-ready` behavior from the development relay when `peerId` matches the local runtime peer id.

**Non-Goals:**

- No protocol schema, relay behavior, production identity, token lifecycle, capture, input, clipboard, file transfer, installer, service, startup, privilege, or native Windows behavior changes.
- No replacement for relay-side registration and recipient enforcement.

## Decisions

- Add a local `relay-ready` peer-id guard after protocol decoding and session matching, before received-event emission.
  - Rationale: the decoded envelope is needed to inspect `peerId`, and the guard must precede room-size workflow side effects.
  - Alternative considered: accept any same-session `relay-ready` and rely on the relay. Rejected because the runtime should fail closed when exercised against an unexpected relay-like source.
- Reuse the existing unsafe inbound protocol redaction path.
  - Rationale: foreign `relay-ready` is untrusted lifecycle metadata and should not expose message type, peer ids, session ids, tokens, or payload fragments in local raw events/logs.
  - Alternative considered: log a specific `relay-ready` mismatch. Rejected because the extra detail is not needed for local safety and increases metadata exposure.
- Keep the change local to agent-shell.
  - Rationale: the relay already sends the registered peer id and existing integration tests cover the normal relay path. This increment hardens the consumer boundary without changing the wire contract.

## Risks / Trade-offs

- A misconfigured relay that sends the wrong peer id will no longer trigger `hello` or viewer authorization requests. -> Mitigation: failing closed is appropriate because peer id binding is a prerequisite for local workflow trust.
- Generic ignored-message diagnostics provide less debugging detail. -> Mitigation: byte length remains available without exposing protocol metadata or secrets.
