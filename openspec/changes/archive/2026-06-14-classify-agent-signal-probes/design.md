## Context

WinBridge currently has a development-only signal probe path in the non-native agent shell. The viewer can send one static signal probe after it observes active visible `screen:view` authorization, and the host can optionally acknowledge that probe after the same runtime signal gates pass. Recent protocol work added a bounded top-level `signal.payload.kind` classifier, but the built-in probe and acknowledgement do not yet use it.

## Goals / Non-Goals

**Goals:**

- Add bounded classifier metadata to the built-in viewer probe and host acknowledgement payloads.
- Keep existing authorization, visibility, revocation, disconnect, recipient, and routing gates unchanged.
- Keep events, logs, status, relay errors, and audit output redacted; the classifier is protocol metadata, not a new diagnostic output surface.

**Non-Goals:**

- Do not add WebRTC SDP, ICE candidates, media transport, screen capture, input, clipboard, file transfer, diagnostics, reconnect, or native Windows APIs.
- Do not add new permissions or loosen the `screen:view` requirement for the existing probe path.
- Do not expose raw signal payloads or marker values in logs, events, status, audit records, or relay diagnostics.

## Decisions

- Use static values `viewer-signal-probe` and `host-signal-probe-ack` for `payload.kind`.
  - Rationale: they are short, protocol-identifier-shaped, non-secret classifiers that match the existing development probe semantics.
  - Alternative considered: reuse the raw marker strings as kind values. That would leak versioned payload marker details into classifier metadata and make future redaction/observability boundaries less clear.

- Preserve the existing marker fields in the payload for matching trusted probes and acknowledgements.
  - Rationale: the current matching logic is already tested against raw payloads while events/logs redact them. Adding `kind` should not make older malformed acknowledgements trusted by itself.
  - Alternative considered: match only on `kind`. That would make classifier metadata authoritative, which is broader than this change needs.

- Keep classifier metadata out of runtime event summaries and status output.
  - Rationale: current signal event summaries intentionally report only redacted payload byte length. This keeps diagnostics secret-safe until a future OpenSpec change explicitly introduces bounded signal kind observability.

## Risks / Trade-offs

- Classifier values increase serialized signal payload size slightly -> Tests assert updated byte lengths and existing protocol payload size bounds still apply.
- A future transport might overinterpret `kind` as permission state -> Specs explicitly state `kind` does not grant permissions, start signaling, bypass consent, or replace authorization checks.
- Adding metadata to built-in signals could expose marker semantics if diagnostics change later -> This change keeps runtime/relay events redacted and documents that future observability requires a separate OpenSpec change.
