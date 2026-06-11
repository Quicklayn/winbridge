## Context

The agent shell emits local `error` runtime events when workflow callbacks fail, such as when a configured audit sink throws. It also logs socket and runtime error messages. Those error messages are supplied by external integrations or transport code and can contain secrets, private paths, raw protocol fragments, or host-private reason text.

Existing requirements say audit sink failures must be surfaced instead of silently dropped. Surfacing the fact of a failure does not require exposing raw exception text in local diagnostics.

## Goals / Non-Goals

**Goals:**

- Prevent runtime `error` events from exposing raw exception messages.
- Prevent runtime and socket error logs from exposing raw `Error.message` values.
- Preserve failure surfacing with a generic error plus safe byte-length metadata.
- Keep workflow fail-closed behavior unchanged when audit sink writes fail.

**Non-Goals:**

- No changes to audit sink interfaces or file persistence behavior.
- No changes to protocol schemas, relay forwarding, authorization state, or consent workflow decisions.
- No native capture/input, WebRTC implementation, reconnect, installer, service, startup, or privilege work.

## Decisions

1. Emit sanitized runtime error events.

   `reportRuntimeError` will compute the raw message byte length, emit `Error("Agent shell runtime error")`, and include `messageBytes` on the event. This proves a failure occurred without leaking raw text.

   Alternative considered: include a hash of the raw message. Rejected because hashes enable correlation of sensitive strings and are unnecessary for tests.

2. Log error byte counts, not raw messages.

   Runtime and socket error logs will use summary metadata such as `messageBytes`. This matches the existing approach for raw inbound text and close reasons.

   Alternative considered: redact only known sensitive substrings. Rejected because external exception text is unstructured and hard to classify safely.

3. Keep failure semantics.

   Audit sink write failures still stop the dependent workflow send path and surface an `error` event. Only the event/log diagnostic content changes.

## Risks / Trade-offs

- Local consumers lose raw exception detail -> intentional; development diagnostics should not leak secrets by default.
- Byte length reveals approximate message size -> acceptable because it does not reveal token, credential, path, pairing, payload, screen, or input contents.
- Start-time connection rejection may still carry the underlying WebSocket error to the direct caller -> this change focuses on persistent local event/log surfaces and does not alter connection error control flow.
