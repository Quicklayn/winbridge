## Context

The managed relay writes a development-mode warning when no shared token is configured, emits a mandatory accepted startup audit record, then writes a listening URL log. The audit record is a security-relevant gate and already closes the listener if persistence fails. The warning and listening log are local diagnostics only.

Direct logger calls mean a test-injected or operator-provided logger can currently fail startup after the listener binds, even when the mandatory startup audit succeeds. That couples observability to relay lifecycle in a way that does not improve consent or authorization safety.

## Goals / Non-Goals

**Goals:**

- Make relay startup warning and listening logs best-effort.
- Preserve exact warning and listening log text when the logger works.
- Preserve startup audit failure semantics: failed audit persistence still rejects startup and closes the listener.
- Add regression coverage that diagnostic logger failure remains secret-safe and non-authorizing.

**Non-Goals:**

- No change to relay admission, room registration, pairing ticket lifecycle, shared token validation, forwarding, rate limiting, heartbeat, or disconnect behavior.
- No new audit event, persistent queue, external dependency, or production monitoring system.
- No exposure of raw logger error text, tokens, pairing codes, protocol payloads, credentials, or remote content.

## Decisions

- Add small relay-local best-effort helpers for `logger.warn` and `logger.log`.
  - Rationale: relay already contains best-effort warning containment for post-send/post-cleanup audit diagnostics, and startup diagnostics should follow the same boundary.
  - Alternative considered: inline `try/catch` around the two startup logger calls. That would work, but named helpers make the diagnostic boundary explicit and reusable.

- Keep development-mode startup audit mandatory and outside the logger containment boundary.
  - Rationale: the audit write is security-relevant evidence for development-mode relay startup; treating it as best-effort would weaken the existing gate.
  - Alternative considered: put warning logging and audit write in a single best-effort block. That was rejected because audit failure must continue to fail closed.

## Risks / Trade-offs

- [Risk] If the diagnostic logger fails, operators may miss local startup text.
  - Mitigation: relay startup state and audit persistence remain authoritative; working loggers still receive the same messages.

- [Risk] Tests could accidentally hide audit failures while hardening logger failures.
  - Mitigation: add coverage specifically asserting the development-mode startup audit is still written when the logger fails, and leave existing audit-failure tests unchanged.
