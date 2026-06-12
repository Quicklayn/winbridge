## Context

The non-native agent shell uses generic protocol `signal` envelopes to exercise future media signaling paths without implementing screen capture or remote input. Runtime send/receive gates already require active, visible, unexpired `screen:view` authorization, but a signal payload can currently omit the authorization id that caused the runtime to allow it.

## Goals / Non-Goals

**Goals:**

- Bind agent-shell outbound and inbound `signal` handling to the current active authorization id.
- Fail closed before socket writes, local `sent` events, local `received` events, or received signal summary logs when the binding is missing or mismatched.
- Keep diagnostics secret-safe by using existing generic signal authorization errors and redacted raw-event handling.

**Non-Goals:**

- No native Windows capture, input injection, clipboard sync, file transfer, diagnostics capture, service installation, startup persistence, reconnect, privilege elevation, or bypass of Windows prompts.
- No relay schema or production authorization model change.
- No WebRTC SDP/candidate validation beyond the existing signal payload safety checks.

## Decisions

- Reuse `signal.payload.authorizationId` instead of adding a top-level wire field.
  The protocol already permits safe non-secret lifecycle identifiers inside signal payloads, and existing signal event redaction hides payload contents from local logs/events. A later protocol version can promote this to a formal schema if needed.

- Enforce binding in agent-shell runtime gates.
  Public send checks already have local authorization snapshots for host and viewer roles. Inbound checks can use the same snapshots before emitting received events. This keeps the bootstrap fail-closed without changing the development relay.

- Treat missing, non-string, or mismatched payload authorization ids as authorization failure.
  The runtime will throw or ignore using existing secret-safe paths. It will not reveal the actual payload keys or values in errors, logs, or runtime events.

## Risks / Trade-offs

- Existing ad hoc signal tests must include `authorizationId` in payloads → update test fixtures to model future media signaling more accurately.
- The binding remains a runtime contract, not a relay-enforced production authorization model → document that production signaling still needs identity/auth and server-side enforcement.
