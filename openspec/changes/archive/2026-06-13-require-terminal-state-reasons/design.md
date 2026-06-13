## Context

WinBridge authorization protocol messages already validate reason text when a reason field is present, and denied authorization decisions require a reason. `session-authorization-state` updates still allow omitted reason text for all statuses, including fail-closed lifecycle states that deny or end access.

This change is limited to protocol validation. It does not alter capture, input, transport, relay routing, installer behavior, service startup, token handling, log storage, or privilege boundaries.

## Goals / Non-Goals

**Goals:**

- Reject terminal `session-authorization-state` messages that omit reason text.
- Keep terminal lifecycle outcomes auditable: `denied`, `revoked`, `terminated`, and `expired`.
- Reuse existing canonical reason validation for blank, untrimmed, unsafe, or oversized text.
- Preserve existing acceptance of optional reasons for non-terminal state updates.

**Non-Goals:**

- No change to permission grant semantics, visibility semantics, capture, input, relay transport, or Windows-native behavior.
- No change to audit persistence or UI rendering.
- No compatibility shim for malformed terminal state messages.

## Decisions

1. Enforce reason presence in `SessionAuthorizationStateMessageSchema`.
   - Rationale: protocol decoding is the earliest shared boundary before relay forwarding, trusted runtime event emission, or workflow processing.
   - Alternative considered: enforce in agent-shell runtime only. Rejected because non-agent producers could still create unauditable terminal state messages.

2. Require reasons only for `denied`, `revoked`, `terminated`, and `expired`.
   - Rationale: those states close access and represent lifecycle outcomes that need explicit operator or system rationale.
   - Alternative considered: require reasons for every state update. Rejected because `pending`, `approved`, `active`, and `paused` state updates may be mechanical transitions where existing optional reason support is enough.

3. Use the existing `ProtocolReasonSchema`.
   - Rationale: it already rejects blank, untrimmed, unsafe, and oversized reason text consistently across authorization-related messages.
   - Alternative considered: create terminal-specific reason validation. Rejected to avoid duplicate policy.

## Risks / Trade-offs

- Stricter schema validation can reject older producers that emit terminal state updates without reason. Mitigation: agent-shell terminal-state producers already emit reasons; tests will cover the protocol boundary directly.
- A missing reason could now fail alongside other validation issues. Mitigation: tests assert the new reason-specific diagnostic for otherwise valid terminal messages.
