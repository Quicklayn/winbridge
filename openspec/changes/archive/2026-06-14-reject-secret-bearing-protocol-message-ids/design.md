## Context

All protocol envelopes share `BaseMessageSchema`, which currently validates `messageId` only through the printable bounded `ProtocolIdentifierSchema`. Relay accepted-forward audit detail records `messageId`, and agent runtime summaries can surface normalized envelope metadata. Other fixed identifiers already use the shared secret-bearing identifier classifier, so `messageId` should use the same deny-only boundary.

## Goals / Non-Goals

**Goals:**

- Reject secret-bearing `messageId` values for every protocol envelope before parsing, encoding, relay forwarding, accepted-forward audit, or runtime use.
- Keep validation diagnostics generic and bounded so raw rejected ids are not exposed.
- Preserve safe non-secret UUID and development message ids.

**Non-Goals:**

- No change to `sessionId`, `peerId`, device id, authorization id, or audit-event-specific identifier compatibility beyond the existing checks.
- No relay authorization, pairing, permission, host consent, capture, input, installer, startup, service, privilege, or native Windows behavior.
- No production identity or authentication model.

## Decisions

- Add a dedicated `ProtocolMessageIdSchema` by refining `ProtocolIdentifierSchema` with `hasSecretBearingProtocolIdentifierMetadata`.
  - Rationale: placing the check in `BaseMessageSchema` covers all current and future protocol envelope types consistently.
  - Alternative considered: add per-message `.superRefine()` checks. Rejected because it is easy to miss future message types and duplicates logic.
- Keep `AuditEventMessageSchema` session/event/actor secret-bearing checks in place.
  - Rationale: this change narrows `messageId`; audit-event-specific fields still need their established diagnostics and coverage.
- Test both protocol and relay behavior.
  - Rationale: protocol tests prove the shared parser/encoder boundary, while relay tests prove unsafe messages fail before forwarding or accepted-forward audit.

## Risks / Trade-offs

- [Risk] Existing local test data or external dev clients might use marker words such as `token` in message ids.
  - Mitigation: safe UUID/default message ids remain accepted; only secret-bearing marker families are denied.
- [Risk] Error messages could accidentally include raw ids from parser internals.
  - Mitigation: use a static Zod refinement message and add tests that assert raw marker text is absent.
