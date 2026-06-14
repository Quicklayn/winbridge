## Context

`SessionAuthorizationSchema` currently requires active and paused records to be visible to the host, rejects pre-active and denied records that report visibility, and now requires post-activation terminal records to carry approval and activation timestamps. It still accepts hand-crafted post-activation terminal records whose timestamps prove a visible session happened but whose `visibleToHost` flag is false.

For WinBridge, final revocation, termination, and post-activation expiration are records of a session that already became visible. Those fail-closed records should preserve visible-session history rather than making final lifecycle evidence look hidden.

## Goals / Non-Goals

**Goals:**

- Reject parsed `revoked` and `terminated` authorization records with `visibleToHost: false`.
- Reject parsed `expired` authorization records with activation history and `visibleToHost: false`.
- Preserve valid pre-access `denied` and non-visible `expired` records that never activated.
- Preserve existing state-machine output for valid terminal records created from visible active or paused sessions.

**Non-Goals:**

- Do not change authorization transition entrypoints beyond their existing schema validation.
- Do not add capture, input, clipboard, file-transfer, installer, startup, service, token, or privilege behavior.
- Do not require pre-access denial or pre-activation expiration to report host visibility.

## Decisions

- Extend schema-level post-activation terminal validation to require `visibleToHost: true`.
  - Rationale: schema parsing is the shared boundary before action authorization and before future adapters consume authorization lifecycle records.
  - Alternative considered: enforce visibility only in transition helpers. That would still let direct schema parsing accept invisible terminal lifecycle evidence.

- Treat `expired` as post-activation only when it carries `activatedAt`.
  - Rationale: pending or approved authorizations can expire before visible activation and should remain fail-closed with `visibleToHost: false`.
  - Alternative considered: require all expired records to be visible. That would reject legitimate pre-access timeout records.

## Risks / Trade-offs

- Direct tests or tools that synthesize invisible revoked or terminated records will fail validation. -> This is intended because revocation and termination are visible live-session transitions.
- Expired records keep two valid shapes: pre-access invisible expiration and post-activation visible expiration. -> Tests will cover both shapes so the distinction remains explicit.
