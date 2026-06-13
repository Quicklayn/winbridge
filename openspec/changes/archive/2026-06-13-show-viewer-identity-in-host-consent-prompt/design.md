## Context

The non-native `agent-shell` supports an opt-in interactive host consent prompt. The runtime already ignores authorization requests unless they are bound to the observed viewer peer. The prompt request passed to the host decision provider currently includes only requested permissions and count, so the host operator cannot see which viewer is asking before typing `approve` or `deny`.

## Goals / Non-Goals

**Goals:**

- Show the host operator bounded viewer identity metadata before accepting an interactive decision.
- Source identity only from already accepted protocol messages: `viewerPeerId` from the trusted authorization request and display name from the observed viewer `hello`.
- Keep existing fail-closed prompt behavior and static host decision behavior unchanged.
- Keep prompt text secret-safe and avoid exposing raw protocol payloads, pairing codes, tokens, private reasons, or remote content.

**Non-Goals:**

- No production account identity, MFA, device trust, or durable identity store.
- No native Windows host UI, screen capture, input, clipboard, file transfer, diagnostics, reconnect, installer, service, startup persistence, or privilege elevation.
- No change to authorization grants, permission widening, relay forwarding rules, or signal payload behavior.

## Decisions

1. **Extend the provider request rather than parsing prompt text from runtime state.**
   - Add `viewerPeerId` and optional `viewerDisplayName` to `HostDecisionProviderRequest`.
   - Rationale: prompt code remains a presentation layer, while runtime owns trusted peer binding.
   - Alternative considered: let prompt code query runtime state directly. Rejected because it couples stdin prompt rendering to runtime internals.

2. **Record observed viewer display name only after accepted `hello`.**
   - Store `observedPeerDisplayName` alongside observed peer id/role when an inbound `hello` passes existing routing and schema validation.
   - Clear it on connection-scoped reset and trusted peer disconnect.
   - Rationale: the display name is already bounded by protocol validation and associated with the observed peer identity.

3. **Render identity as host-facing consent text, not logs/audit/events.**
   - The prompt may show viewer peer id and validated display name to the local host operator.
   - Runtime logs, events, audit records, and errors continue to avoid raw display names and protocol payloads.
   - Rationale: host-facing consent UI needs identity context; diagnostics and audit streams should remain metadata-safe.

## Risks / Trade-offs

- [Risk] Display name could be mistaken for production identity. -> Document it as development peer metadata, not account authentication.
- [Risk] Prompt output could become a leak path. -> Only render bounded peer id/display name plus permission names/count; add tests that tokens, pairing codes, private reasons, payload markers, and remote content are absent.
- [Risk] Authorization request could race with viewer disconnect. -> Keep existing post-prompt `canSendHostAuthorizationDecision` gate and tests for stale prompt resolution.
