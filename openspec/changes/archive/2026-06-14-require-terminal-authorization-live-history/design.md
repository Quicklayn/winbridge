## Context

`SessionAuthorizationSchema` already enforces permission clearing for terminal states, required terminal timestamps, impossible timestamp combinations, and ordering when prior timestamps are present. However, hand-crafted `revoked`, `terminated`, or visible post-activation `expired` records can omit both `approvedAt` and `activatedAt` and still parse as trusted fail-closed lifecycle records.

For WinBridge, final revocation and termination are post-access outcomes. Visible expiration also represents a session that reached visible activation. Those records should preserve evidence that the session first reached explicit host approval and visible activation. `denied` and non-visible `expired` records remain different: they can be pre-access terminal outcomes and MUST NOT require activation history.

## Goals / Non-Goals

**Goals:**

- Reject parsed `revoked`, `terminated`, and visible `expired` records that lack `approvedAt`.
- Reject parsed `revoked`, `terminated`, and visible `expired` records that lack `activatedAt`.
- Preserve existing state-machine output for valid terminal records created after visible active or paused sessions.
- Preserve valid denied and non-visible expired records without live-session history.

**Non-Goals:**

- Do not change authorization transition entrypoints other than their existing schema validation.
- Do not add new permissions or remote access capabilities.
- Do not change capture, input, relay routing, installer, startup, service, token, log persistence, or privilege behavior.

## Decisions

- Add a schema-level helper that requires prerequisite live-session timestamps for `revoked`, `terminated`, and visible `expired` statuses.
  - Rationale: schema validation is the narrowest common gate before local authorization checks and future adapters consume authorization records.
  - Alternative considered: validate only in transition functions. That would still allow direct schema parsing of forged terminal records without consent/visibility history.

- Keep `denied` and non-visible `expired` records out of the new prerequisite check.
  - Rationale: denial and pre-access expiration are correct fail-closed results before host approval or visible activation. Requiring activation history for them would invert the consent lifecycle.
  - Alternative considered: require live history for all terminal statuses. That would reject legitimate host denial and pending-timeout records.

- Add focused tests at the schema boundary.
  - Rationale: the bug is direct parsing behavior, not runtime transition generation. Existing transition tests already cover valid terminal output.

## Risks / Trade-offs

- Older direct tests or development tools that synthesize terminal records without prior live history will fail validation. -> This is intended; such records are no longer considered auditable lifecycle evidence.
- Terminal records remain fail-closed even when malformed. -> Rejection still improves audit integrity and avoids treating incomplete lifecycle data as trusted authorization state.
