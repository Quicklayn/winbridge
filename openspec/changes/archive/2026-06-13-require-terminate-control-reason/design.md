## Context

Session-control messages are the protocol-level intent for host pause, resume, terminate, and permission revocation. The current schema requires a reason for `revoke-permission`, but allows `terminate` without a reason even though termination immediately ends an active or paused authorization and is represented in the authorization state model with a required reason.

The agent shell already sends a default termination reason when no CLI reason is provided. This change primarily closes the protocol validation gap for malformed or hand-crafted messages.

## Goals / Non-Goals

**Goals:**

- Require an explicit, schema-valid reason for `session-control` messages with action `terminate`.
- Preserve existing `pause` and `resume` behavior where reasons remain optional but validated when present.
- Keep termination reasons bounded and control-character-safe through the existing shared reason schema.

**Non-Goals:**

- Do not add new session-control actions or remote access capabilities.
- Do not change relay routing, token handling, pairing, native Windows capture/input, installer, startup, services, or privilege behavior.
- Do not require pause or resume reasons; those controls are reversible and already paired with visible host state updates.

## Decisions

- Enforce the terminate reason in `SessionControlMessageSchema`.
  - Rationale: relay and agent-shell already parse protocol envelopes before forwarding or processing, so schema-level validation fails closed for all callers.
  - Alternative considered: enforce only in agent-shell runtime. That would leave direct protocol users and relay forwarding paths able to carry unauditable terminate controls.

- Reuse `ProtocolReasonSchema`.
  - Rationale: existing reason validation already rejects blank, untrimmed, oversized, ASCII control, and Unicode formatting-control text.
  - Alternative considered: introduce terminate-specific reason rules. That would add complexity without a different security requirement.

## Risks / Trade-offs

- Older development clients that send `terminate` without a reason will be rejected by newer schema validation. -> Current agent-shell sends a default reason, and rejection is the desired fail-closed behavior for unauditable controls.
- Termination reason text can still contain private prose, but event display paths redact protocol reasons where appropriate. -> This change bounds and validates the reason; privacy redaction remains handled by existing runtime/event logic.
