## Context

The shared protocol schema accepts authorization-bound `signal` payloads as JSON-compatible objects, while the relay and agent shell redact signal payloads from logs and events. Tests and development signaling already use an optional top-level `kind` field for classifiers such as `offer`, `candidate`, and static probe metadata, but the classifier is not currently validated as a bounded metadata field.

## Goals / Non-Goals

**Goals:**

- Treat top-level `signal.payload.kind`, when present, as metadata rather than arbitrary remote-assistance content.
- Require `kind` to be a short, trimmed, protocol-identifier-shaped string with no secret-bearing marker families.
- Keep all existing signal authorization, routing, payload size, JSON compatibility, sensitive-key, redaction, and fail-closed behavior intact.
- Add focused protocol tests and relay/agent coverage showing malformed `kind` values are rejected before forwarding or runtime received events.

**Non-Goals:**

- No new signal message type, relay routing behavior, WebRTC negotiation state machine, SDP/ICE parser, media transport, screen capture, input, clipboard, file transfer, diagnostics, reconnect, installer, startup, service, privilege, or native Windows behavior.
- No exposure of `kind` in runtime events, logs, relay errors, or audit output.
- No permission changes; `kind` metadata does not grant or imply host consent, visibility, or authorization.

## Decisions

- Validate only the optional top-level `kind` field.
  - Rationale: this field is the likely future classifier for signaling state, so bounding it now reduces future metadata risk without constraining opaque non-secret SDP/ICE payload content.
  - Alternative considered: validate every string value in the signal payload for secret-bearing metadata. That is too broad for future signaling and could reject legitimate SDP/ICE strings before a dedicated media design exists.
- Reuse the existing protocol identifier shape and secret-bearing identifier detector for `kind`.
  - Rationale: it matches existing metadata constraints and avoids introducing a second classifier grammar.
  - Alternative considered: enumerate allowed kind values now. That would be premature because WebRTC signaling kinds have not been fully specified.
- Keep redaction unchanged.
  - Rationale: this change hardens validation only; exposing signal classifiers belongs in a future explicit observability change.
  - Alternative considered: include `kind` in signal event summaries. That would widen logs/events and require separate user-visible metadata requirements.

## Risks / Trade-offs

- Overly strict `kind` validation could reject a benign ad hoc development classifier. Mitigation: accepted values can still use existing protocol identifier characters and common forms like `offer`, `answer`, `candidate`, `host-offer`, and `viewer-signal-probe`.
- A bounded `kind` field could be mistaken as permission to start media. Mitigation: specs and tests state it remains non-authorizing and does not grant capture, input, signaling start, reconnect, or host controls.
- Secret-bearing values in other signal payload fields remain possible if their keys are non-sensitive. Mitigation: payloads are still redacted from local diagnostics, existing sensitive key checks remain enforced, and broader media/data validation is reserved for future dedicated OpenSpec work.
