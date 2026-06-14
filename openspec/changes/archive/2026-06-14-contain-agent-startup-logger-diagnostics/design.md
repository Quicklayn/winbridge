## Context

The managed agent shell writes three static informational log lines when the WebSocket opens, then sends `join-session`. These log lines explain the development shell role and explicitly state that native capture/input are not implemented. They are useful diagnostics, but they are not part of consent, authorization, relay admission, or remote-action gating.

The runtime already has a best-effort helper for log messages used in close cleanup paths. Startup logging can use the same diagnostic boundary so logger failures do not escape the WebSocket open callback.

## Goals / Non-Goals

**Goals:**

- Make startup informational logging best-effort.
- Preserve existing startup log text when the logger works.
- Ensure logger failure does not block the relay join attempt.
- Add regression coverage that startup logger failure remains secret-safe and non-authorizing.

**Non-Goals:**

- No change to relay admission, pairing, shared token handling, consent decisions, authorization lifecycle, host visibility, capture, input, reconnect, or protocol message routing.
- No new audit event, persistent queue, external dependency, or production monitoring system.
- No exposure of raw logger error text, tokens, pairing codes, protocol payloads, credentials, or remote content.

## Decisions

- Reuse `logRuntimeLoggerMessageBestEffort` for the three static startup log lines.
  - Rationale: this helper already defines the local boundary for non-authoritative runtime logging.
  - Alternative considered: inline `try/catch` around each startup log. That would work, but the helper keeps best-effort logging consistent with existing cleanup diagnostics.

- Keep startup logging before `join-session` but make it non-blocking.
  - Rationale: retaining order preserves current operator-facing log sequence when diagnostics work, while a diagnostic failure cannot prevent protocol startup.
  - Alternative considered: move startup logs after `join-session`. That would change event ordering without improving the consent boundary.

## Risks / Trade-offs

- [Risk] If the diagnostic logger fails, startup information is not observable through that logger.
  - Mitigation: the startup log is informational only; relay join, consent, authorization, and visibility state remain authoritative.

- [Risk] Tests that verify startup continuation can become timing-sensitive.
  - Mitigation: use the existing local relay integration harness and assert the host's local `join-session` sent event after `runtime.start()` resolves.
