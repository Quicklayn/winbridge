## Context

The host runtime can schedule development lifecycle actions such as revoke, pause, resume, terminate, expiration, and local disconnect. Before sending those actions, it checks connection and authorization preconditions. When the peer or local socket is already disconnected, the runtime correctly suppresses the delayed workflow send and writes a bounded local skip log.

Those skip logs are not consent evidence, authorization state, audit records, or protocol messages. If the configured diagnostic logger throws while writing a skip log, the timer callback can surface a runtime error even though the correct behavior is to remain silent and send nothing after disconnect.

## Goals / Non-Goals

**Goals:**

- Contain delayed host workflow skip logger failures after the runtime has decided to suppress a send.
- Preserve fail-closed disconnected-state checks and all existing authorization lifecycle gates.
- Keep skip log text unchanged when the logger works.
- Add regression coverage that logger failure is secret-safe and non-authorizing.

**Non-Goals:**

- No change to host consent decisions, permission grant resolution, authorization TTL, lifecycle state transitions, relay behavior, or status snapshots.
- No change to audit persistence ordering for real lifecycle actions.
- No new audit event, persistent queue, external dependency, production UI, reconnect behavior, capture, or input support.
- No exposure of raw logger error text, tokens, pairing codes, protocol payloads, display names, credentials, private reasons, or remote content.

## Decisions

- Route delayed workflow skip diagnostic log lines through the existing best-effort runtime log helper.
  - Rationale: these lines are observability after a send has already been suppressed; they must not be able to convert a fail-closed no-send decision into a runtime error.
  - Alternative considered: wrap delayed timer callbacks. That was rejected because audit persistence and lifecycle send failures for real actions should still surface through existing runtime diagnostics.

- Keep `canSendDelayedHostWorkflow` as the main connection-state gate for local and remote disconnect suppression.
  - Rationale: the existing gate already centralizes peer/local/socket disconnected checks; changing only the logging side keeps behavior narrow.

## Risks / Trade-offs

- [Risk] If the diagnostic logger fails, operators may miss a skip log line.
  - Mitigation: the disconnected state and no-send behavior remain authoritative; working loggers still receive the same bounded text.

- [Risk] Over-broad containment could hide real lifecycle action failures.
  - Mitigation: this change only contains diagnostic logging in paths that already return `false` before sending protocol or audit messages.
