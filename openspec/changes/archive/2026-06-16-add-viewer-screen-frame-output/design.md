## Context

The runtime already accepts inbound `screen-frame` envelopes only after matching
the observed host, local viewer role, active visible authorization, and
`screen:view` grant. The accepted frame is currently exposed only as a redacted
runtime event. MVP remote viewing needs a concrete observation path, but raw
screen bytes must not leak into logs, audit records, events, or errors.

## Goals / Non-Goals

**Goals:**

- Add an explicit viewer-only CLI option for a latest-frame output file.
- Require a configured local audit sink when the output option is enabled.
- Persist only inbound frames that pass the existing authorization and routing
  gates.
- Write metadata-only audit before local file persistence and fail closed if the
  audit sink fails.
- Keep all public diagnostics redacted and metadata-only.
- Cover authorized write, authorization loss, audit failure, path validation,
  and redaction with focused tests.

**Non-Goals:**

- No desktop renderer or windowed viewer UI.
- No host OS input application.
- No hidden viewing, unattended mode, services, startup persistence, installer
  behavior, elevation, AV/EDR evasion, or Windows prompt bypass.
- No WebRTC media pipeline, quality controls, clipboard, or file transfer.

## Decisions

1. Use an explicit output path, not automatic screenshots.

   Writing bytes is a local persistence side effect. Requiring a viewer CLI flag
   keeps it opt-in and makes tests and operator intent clear. The option also
   requires local audit configuration so audit-before-write cannot silently
   degrade into a no-op.

2. Hook after inbound authorization and before public received event emission.

   The existing inbound gate already validates direction, peer binding,
   authorization id, visibility, expiry, and permission. File persistence should
   happen only after that gate and should not create a trusted received event if
   audit/file persistence fails.

3. Audit before file write, with metadata-only details.

   The audit record includes authorization id, frame id, sequence, format,
   dimensions, and encoded payload byte length. It never stores raw bytes,
   screenshots, or base64 data. If audit persistence fails, the output write is
   blocked.

## Risks / Trade-offs

- The output file intentionally contains screen bytes -> this is limited to an
  explicit viewer path after consent-bound authorization and local audit.
- Overwriting a single file is not a real renderer -> acceptable for MVP
  verification; a later viewer UI can consume the same authorized sink boundary.
- A path option can target sensitive local locations -> path validation reuses
  the existing safe file-path checks and still treats the path as an explicit
  local operator choice.
