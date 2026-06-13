## Context

The development relay and agent shell use `signal` messages as the future transport-signaling contract. Signal payloads are not screen frames or input events; they are bounded JSON-compatible objects that must carry a top-level `authorizationId`. Accepted payloads are forwarded to the other peer after protocol validation, so key names need to be unambiguous for future adapters and debugging.

## Goals / Non-Goals

**Goals:**

- Reject ASCII control characters in signal payload property names.
- Reject Unicode bidi and zero-width formatting controls, including `U+FEFF`, in signal payload property names.
- Apply validation recursively after JSON canonicalization and before forwarding or event emission.
- Preserve existing rejection for non-JSON values, sensitive keys, missing or malformed authorization id, and oversized payloads.
- Keep diagnostics generic and free of raw malformed key/value text.

**Non-Goals:**

- No WebRTC implementation, capture, input, clipboard, file transfer, reconnect, or production auth semantics.
- No broader signal payload grammar beyond rejecting visually unsafe keys.
- No automatic normalization, rewriting, or repair of malformed payload keys.

## Decisions

- Add a signal-specific recursive key validator colocated with existing sensitive-key detection.
  - Rationale: signal payloads have their own policy, and this avoids broadening audit or generic JSON behavior accidentally.

- Validate unsafe key names before sensitive-key detection.
  - Rationale: a malformed key should fail closed with a generic key-safety diagnostic rather than relying on normalized sensitive-key matching.

- Keep relay and agent-shell tests at their existing boundaries.
  - Rationale: shared protocol validation is the source of truth; relay and agent-shell tests prove it is used before forwarding, trusted events, or socket writes.

## Risks / Trade-offs

- [Risk] Some local experiments may have arbitrary signaling keys with zero-width or control characters. -> Mitigation: fail closed because metadata must be unambiguous.
- [Risk] This does not define a full WebRTC signaling schema. -> Mitigation: current scope is a safety hardening step; a future media-transport OpenSpec can define full signaling grammar.
- [Risk] This touches signaling and relay paths. -> Mitigation: run focused tests, full gates, strict OpenSpec validation, and security review before archive.
