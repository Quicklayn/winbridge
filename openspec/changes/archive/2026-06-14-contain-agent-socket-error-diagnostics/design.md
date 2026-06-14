## Context

The managed agent shell already redacts runtime and socket error diagnostics with `formatAgentShellErrorLog`. Most cleanup-sensitive diagnostic paths use best-effort helpers, but the WebSocket socket `error` callback calls `logger.error(...)` directly. A diagnostic logger exception from that callback is not part of consent or authorization semantics and should not be able to escape as a runtime-side effect.

This change is limited to non-native agent shell socket-error diagnostics. It does not change protocol validation, relay behavior, authorization lifecycle transitions, visible host indicator behavior, or any remote action capability.

## Goals / Non-Goals

**Goals:**

- Make socket-error diagnostic logging best-effort.
- Preserve current socket error log redaction and byte-length metadata.
- Add regression coverage for diagnostic logger failure during socket-error reporting.
- Confirm socket-error logger failure remains non-authorizing and secret-safe.

**Non-Goals:**

- No change to WebSocket connection retry, lifecycle restart, relay transport, consent decisions, authorization state, host visibility, capture, input, or protocol message routing.
- No new audit event, persistent queue, external dependency, or production monitoring system.
- No exposure of raw socket error text, logger error text, tokens, pairing codes, protocol payloads, credentials, or remote content.

## Decisions

- Reuse the existing `logRuntimeLoggerErrorBestEffort` pattern for socket errors.
  - Rationale: the runtime already has best-effort log helpers for cleanup paths; using the same style keeps diagnostics bounded and local.
  - Alternative considered: wrapping only the socket `error` handler inline. That would work, but a named helper makes the intended diagnostic boundary explicit and easier to reuse.

- Keep `formatAgentShellErrorLog("socket", error)` as the only socket-error message formatter.
  - Rationale: this preserves existing metadata-only output and avoids raw exception text.
  - Alternative considered: emitting no socket-error log when the callback fires. That would remove useful local diagnostics without improving safety.

## Risks / Trade-offs

- [Risk] If the diagnostic logger fails, the socket error is not observable through logs.
  - Mitigation: logger failure is a diagnostics failure only; socket lifecycle events and consent/authorization gates remain authoritative.

- [Risk] Tests that synthesize socket errors can become timing-sensitive.
  - Mitigation: use a local WebSocket test server that accepts a connection and closes the underlying socket, then assert absence of raw markers after a bounded wait.
