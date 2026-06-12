## Context

The development relay enables heartbeat liveness checks by default. Timer environment values already use exact bounded integer parsing, but `WINBRIDGE_RELAY_HEARTBEAT_ENABLED` currently trims input before matching accepted flags. That makes padded values such as ` false ` valid even though the flag controls whether liveness checks are scheduled.

## Goals / Non-Goals

**Goals:**

- Reject untrimmed or otherwise non-canonical `WINBRIDGE_RELAY_HEARTBEAT_ENABLED` values before the relay accepts peers.
- Keep omitted `WINBRIDGE_RELAY_HEARTBEAT_ENABLED` enabled by default.
- Keep canonical accepted values unchanged: `true`, `false`, `yes`, `no`, `1`, and `0`.
- Keep diagnostics bounded and avoid echoing raw environment values.

**Non-Goals:**

- No changes to heartbeat interval or timeout semantics.
- No changes to reconnect policy, stale-session cleanup, or production distributed liveness.
- No changes to consent, authorization, screen capture, input, clipboard, file transfer, installer behavior, startup persistence, services, privilege elevation, Windows native APIs, tokens, audit record schema, or production authentication.

## Decisions

1. Reject padded flag values instead of trimming them.
   - Rationale: this environment value toggles relay liveness behavior. Silent trimming hides ambiguous deployment input and is inconsistent with exact timer configuration.
   - Alternative considered: continue trimming. Rejected because it accepts visually ambiguous configuration for a safety-adjacent relay startup boundary.

2. Preserve lowercase canonical values only.
   - Rationale: the existing public examples use lowercase values and the accepted set is small. Keeping exact values makes tests and diagnostics deterministic.
   - Alternative considered: accept case-insensitive canonical values such as `FALSE`. Rejected because this change is about removing implicit normalization rather than expanding accepted input.

3. Keep error messages generic.
   - Rationale: environment values may reveal operator conventions or deployment metadata. The error only needs to identify the malformed variable.
   - Alternative considered: report the rejected raw value. Rejected as unnecessary for remediation.

## Risks / Trade-offs

- [Risk] A development setup that sets `WINBRIDGE_RELAY_HEARTBEAT_ENABLED` with whitespace or uppercase values will fail at startup. -> Mitigation: use one of the documented lowercase canonical values without padding.
- [Risk] This does not add production-grade distributed liveness management. -> Mitigation: keep the change scoped to development relay startup validation and leave production liveness as a separate design topic.
