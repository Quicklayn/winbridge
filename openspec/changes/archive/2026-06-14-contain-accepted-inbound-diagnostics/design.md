## Context

The agent-shell runtime validates and rejects unsafe inbound data before accepted protocol message handling. Once a message reaches the accepted path, the runtime emits a redacted local `received` event, logs a bounded summary, and then runs consent workflow, lifecycle, status, or signal handling.

The accepted-message summary logger is currently a direct `options.logger?.log(...)` call. If a diagnostic logger throws, the async message handler reports a runtime error before processing the valid message, making optional observability behave like an authorization or workflow gate.

## Goals / Non-Goals

**Goals:**

- Make accepted inbound protocol summary logging best-effort.
- Preserve the ordering where local `received` event emission happens before the summary log.
- Preserve unsafe inbound rejection, redaction, consent, host visibility, permission grant, signal authorization, and audit persistence semantics.
- Cover a host authorization request path where the logger fails but explicit approval still drives the normal active visible workflow.

**Non-Goals:**

- Do not catch failures from the local `received` event callback.
- Do not alter protocol validation, unsafe inbound filtering, message redaction, public send authority checks, host consent decisions, audit persistence failure handling, relay behavior, or signal payload validation.
- Do not add native capture, input, installer, service, startup persistence, privilege elevation, stealth, or bypass behavior.

## Decisions

- Route only the accepted inbound summary log through `logRuntimeMessageBestEffort`.
  - Rationale: the project already uses this helper for diagnostics that must not control fail-closed cleanup or workflow continuation.
  - Alternative considered: wrap the whole accepted-message handling block in a catch. Rejected because it would risk hiding event callback, consent provider, audit, or workflow failures that are intentionally surfaced.

- Keep `options.onEvent?.({ direction: "received", ... })` unchanged.
  - Rationale: this change is about diagnostic log containment, not changing event callback semantics. A consumer callback failure can still surface as a runtime error.

- Test with a same-session `session-authorization-request`.
  - Rationale: it proves the logger failure no longer blocks the explicit approval path while still requiring existing consent, visible-session, and audit gates.

## Risks / Trade-offs

- [Risk] A broken logger may miss the accepted inbound summary line. → Mitigation: the local redacted `received` event still exists, and working loggers retain the same summary output.
- [Risk] Continuing after logger failure might look like weakening fail-closed behavior. → Mitigation: only the diagnostic log call is contained; validation, unsafe filtering, consent decisions, host visibility, signal authorization, and audit persistence remain unchanged and tested.

## Migration Plan

No migration is required. The runtime API, protocol schema, event shapes, and CLI options are unchanged. Rollback is the single-line runtime call plus associated tests/spec archive.

## Open Questions

None.
