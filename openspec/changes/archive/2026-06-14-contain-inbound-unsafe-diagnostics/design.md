## Context

The agent shell emits a redacted local `raw` event and a bounded log line when it receives inbound data that is not a valid protocol envelope or a decoded protocol envelope that is unsafe for the current runtime. These paths are fail-closed: the raw input is ignored before it can affect consent, authorization, peer state, signaling, or lifecycle workflows.

The log line is optional diagnostics. If the configured logger throws after the runtime has classified the input as unsafe, the message callback can surface a runtime error even though no protocol send or state transition should happen for that input.

## Goals / Non-Goals

**Goals:**

- Contain logger failures for inbound non-protocol and ignored unsafe protocol diagnostics.
- Preserve redacted `raw` event emission and existing unsafe-input classification.
- Preserve all no-send behavior for ignored unsafe inbound data.
- Add regression coverage that logger failure remains secret-safe and non-authorizing.

**Non-Goals:**

- No change to protocol parsing, validation, signal authorization, host consent decisions, permission grants, lifecycle transitions, or relay behavior.
- No change to `onEvent` semantics. Event callback failure is outside this change.
- No new audit event, persistent queue, external dependency, production UI, capture, input, reconnect, or native Windows behavior.
- No exposure of raw logger error text, raw protocol payloads, tokens, pairing codes, display names, credentials, private reasons, or remote content.

## Decisions

- Route only the unsafe inbound diagnostic logger calls through the existing best-effort runtime log helper.
  - Rationale: the logger call is observability after unsafe input has already been reduced to redacted `raw` metadata. It must not affect the ignore/no-send decision.
  - Alternative considered: catch the whole unsafe input reporting function. That was rejected because this change should not hide failures in the redacted event callback.

- Keep accepted protocol message logging unchanged in this increment.
  - Rationale: accepted protocol handling has broader behavior ordering and deserves a separate change if needed. This increment is scoped to inputs already classified as unsafe.

## Risks / Trade-offs

- [Risk] If the diagnostic logger fails, operators may miss a local unsafe-input log line.
  - Mitigation: local redacted `raw` events remain authoritative, and working loggers still receive the same bounded text.

- [Risk] Over-broad containment could hide event rendering failures.
  - Mitigation: this change does not catch or alter `options.onEvent?.({ direction: "raw", ... })`; it only contains the logger call that follows.
