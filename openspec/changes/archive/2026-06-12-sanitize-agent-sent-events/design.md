## Context

`encodeProtocolEnvelope` serializes `parseProtocolEnvelope(envelope)`, so protocol transforms such as `audit-event.detail` redaction apply to the wire payload. `sendProtocol` currently calls `options.onEvent` with the unparsed input object. This means local tooling using the managed runtime event stream can observe a different and less safe message than the one actually sent.

## Goals / Non-Goals

**Goals:**

- Make `sent` runtime events use a schema-normalized event-safe envelope.
- Redact local event-only sensitive fields, including raw pairing codes, that are still required in the wire payload.
- Keep invalid outbound messages rejected before the event callback fires.
- Keep sensitive audit detail redaction centralized in protocol schema parsing.
- Preserve existing runtime behavior for received and raw events.

**Non-Goals:**

- No changes to relay forwarding behavior.
- No changes to protocol schema semantics or redaction rules.
- No new production logging or audit persistence feature.

## Decisions

- Parse the outbound envelope inside `sendProtocol` before sending and before `onEvent`.
  - Rationale: one boundary can guarantee outbound events use validated/transformed protocol data.
- Serialize the normalized envelope rather than the original input.
  - Rationale: wire payload validation and protocol transforms must apply before sending.
- Apply event-only redaction after protocol normalization and before `onEvent`.
  - Rationale: the relay still needs the pairing code in the wire `join-session` message, but local event consumers do not.
- Keep the event shape unchanged.
  - Rationale: consumers still receive `{ direction: "sent", message }`, but `message` is now the safe normalized envelope.

Alternative considered: redact only `audit-event` details in `sendProtocol`. This was rejected because protocol parsing already owns redaction and validation; duplicating rules in the agent shell risks drift.

## Risks / Trade-offs

- [Risk] Direct callers that expected object identity or raw pairing codes in sent events will now receive a normalized redacted copy. -> Mitigation: runtime events are observational; the wire payload remains unchanged for relay behavior.
- [Risk] Double parsing could add overhead. -> Mitigation: outbound message volume in this development shell is low, and correctness is more important than micro-optimization.
