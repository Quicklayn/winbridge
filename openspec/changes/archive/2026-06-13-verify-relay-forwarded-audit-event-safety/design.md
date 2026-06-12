## Context

Accepted relay forwarding audit details are intentionally limited to message type, message id, recipient peer id, recipient role, and for `signal` only the non-secret `authorizationId`. Protocol `audit-event.detail` redaction already runs during parse/encode, but relay integration coverage does not directly exercise accepted forwarding of an `audit-event` carrying sensitive detail fields.

## Goals / Non-Goals

**Goals:**

- Add WebSocket integration coverage for accepted forwarded `audit-event` messages.
- Verify protocol-level redaction is visible to the receiving peer.
- Verify accepted relay forwarding audit detail contains only safe message and recipient routing metadata.
- Verify the accepted relay forwarding audit record omits raw audit-event detail values and private markers.

**Non-Goals:**

- No runtime behavior changes.
- No protocol schema changes.
- No audit schema or persistence changes.
- No changes to consent, authorization grants, screen capture, input, clipboard, file transfer, installer behavior, startup persistence, services, privilege elevation, Windows native APIs, relay authority rules, or token handling.

## Decisions

1. Add integration coverage rather than changing `acceptedForwardAuditDetail`.
   - Rationale: the implementation already returns bounded metadata for non-signal messages, including `audit-event`.
   - Alternative considered: add a special `audit-event` branch in relay runtime. Rejected because special casing would expand behavior without need.

2. Assert both recipient redaction and relay audit omission.
   - Rationale: recipient redaction proves protocol validation sanitized the forwarded message, while relay audit omission proves accepted forwarding audit does not persist raw protocol detail.
   - Alternative considered: assert only the relay audit detail object. Rejected as incomplete because it would not prove the forwarded protocol view was redacted.

## Risks / Trade-offs

- [Risk] Integration tests add a small amount of suite time. -> Mitigation: reuse the existing paired-session helper and audit sink.
- [Risk] The relay audit omission test could pass even if protocol redaction failed. -> Mitigation: assert the viewer receives redacted sensitive detail values separately from the relay audit record assertions.
