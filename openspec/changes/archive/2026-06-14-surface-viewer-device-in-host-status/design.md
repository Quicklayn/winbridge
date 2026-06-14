## Context

The development agent shell stores an observed opposite-role viewer `hello` device identity and already passes bounded viewer device id/platform fields to the interactive host consent provider. Host status snapshots are read-only local metadata for future UI wiring and current CLI status output, but today they only report lifecycle state, visibility, permission count, authorization metadata, expiration, and inactive/disconnect causes.

Surfacing the same safe device id/platform in host status helps the host understand the active visible session without creating a new permission or remote access capability.

## Goals / Non-Goals

**Goals:**

- Add optional `viewerDeviceId` and `viewerDevicePlatform` fields to host status snapshots.
- Bind those fields from the currently observed trusted viewer device identity at host approval time for the current host authorization scope.
- Render safe optional fields in host status CLI output when present.
- Preserve immutable read-only status snapshots and ensure status reads remain side-effect-free.
- Keep self-asserted `trustLevel`, viewer peer id, and viewer display name out of host status.

**Non-Goals:**

- No new authorization, authentication, trust evaluation, or production identity semantics.
- No capture, input, clipboard, file-transfer, diagnostics, reconnect, native Windows API, installer, service, startup, persistence, privilege elevation, hidden-session, or Windows prompt-bypass behavior.
- No relay protocol routing changes and no new workflow audit event payloads.
- No exposure of raw protocol payloads, private reasons, signal payloads, secrets, screen contents, or input contents.

## Decisions

- Reuse the already validated `DeviceIdentity` stored from trusted viewer `hello`.
  - Rationale: the protocol schema already bounds device id/platform metadata and rejects unsafe device identity before workflow handling.
  - Alternative considered: re-parse or sanitize in the status formatter. Rejected because host status should not carry unsafe values in the first place, and duplicating validation would make boundaries harder to audit.
- Show only device id and platform.
  - Rationale: these are bounded device context fields already approved for host consent prompts.
  - Alternative considered: include display name and `trustLevel`. Rejected because display name is more user-identifying than needed for status, and `trustLevel` is self-asserted remote metadata that must not be presented as verified trust.
- Include device context only while current authorization metadata is active or paused, and keep it authorization-bound after approval.
  - Rationale: host status must not reuse stale viewer metadata after disconnects or peer changes, and later same-peer `hello` updates must not rewrite the visible context for an already approved grant.
  - Alternative considered: preserve last-known device context in inactive status. Rejected because a disconnected or replaced viewer should not continue to look associated with the host control surface.

## Risks / Trade-offs

- [Risk] Device id may be mistaken for production account authentication.
  - Mitigation: docs and specs label it as non-authorizing development metadata and status omits trust level.
- [Risk] Mutable same-peer metadata could rewrite host status after approval.
  - Mitigation: bind viewer device id/platform into the authorization snapshot at approval time and test post-approval `hello` changes.
- [Risk] CLI output could reveal unsafe text.
  - Mitigation: status fields come only from schema-valid device identity and formatter emits fields only when present.
