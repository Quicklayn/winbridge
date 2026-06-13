## Context

Viewer-side signal authorization depends on a lifecycle chain: a host decision establishes the authority and authorization id, then host-originated state/control messages update whether `screen:view` is active and visible. Existing code validates later lifecycle messages against the authority recorded from the decision, but the initial decision only checks `viewerPeerId`.

## Goals / Non-Goals

**Goals:**

- Bind `session-authorization-decision.hostPeerId` to the already observed opposite-role host before accepting the decision.
- Reject unobserved, same-role, or mismatched host decisions before local `received` event emission and before `viewerAuthorization` mutation.
- Keep ignored-message diagnostics redacted and metadata-only.
- Preserve normal relay workflow where `hello` establishes host presence before authorization lifecycle messages are trusted.

**Non-Goals:**

- Do not add capture, input, clipboard, file transfer, diagnostics collection, reconnect, installer, startup, service, privilege, or Windows-native behavior.
- Do not change protocol schemas or relay routing.
- Do not treat `relay-ready` room size as sufficient host identity.

## Decisions

- Reuse observed peer identity as the decision authority gate.
  - Rationale: `sessionState.observedPeerId/observedPeerRole` is already the agent-shell presence boundary used for public sends, host request binding, and trusted disconnect handling.
  - Alternative considered: allow any local-viewer decision and rely on later state authority matching. Rejected because the decision itself seeds the authority and can make later forged state look internally consistent.

- Guard before `received` event emission.
  - Rationale: ignored decisions may contain private reasons, grants, peer ids, and authorization ids. Existing unsafe inbound boundaries report only redacted raw metadata before local protocol events/log summaries.
  - Alternative considered: emit a redacted received decision but ignore state mutation. Rejected because local consumers could still treat the received decision as trusted workflow metadata.

- Update synthetic test servers, not production workflow.
  - Rationale: normal relay scenarios already exchange `hello`; only custom lifecycle test servers need explicit host presence to model a trusted host authority.

## Risks / Trade-offs

- A lifecycle stream that sends authorization decisions before host `hello` will now fail closed. This is acceptable because the viewer has not established a concrete host authority yet.
- Some tests must add synthetic host presence to remain valid. This makes the tests closer to the real relay handshake and keeps forged lifecycle tests explicit.
