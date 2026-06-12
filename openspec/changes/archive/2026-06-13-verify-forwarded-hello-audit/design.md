## Context

Accepted relay forwarding audit details are intentionally limited to message type, message id, recipient peer id, recipient role, and for `signal` only the non-secret `authorizationId`. The current integration suite proves this for `signal` payloads and authorization request display metadata, but does not directly exercise `hello`, whose display name and capability list are user-visible presence metadata.

## Goals / Non-Goals

**Goals:**

- Add WebSocket integration coverage for accepted `hello` forwarding audit metadata.
- Verify the forwarded `hello` reaches the intended recipient.
- Verify the accepted forwarding audit detail contains only safe routing and message identifiers.
- Verify the accepted forwarding audit record omits raw `hello.displayName` and capability metadata.

**Non-Goals:**

- No runtime behavior changes.
- No changes to protocol schemas.
- No changes to audit schemas or persistence behavior.
- No changes to consent, authorization, screen capture, input, clipboard, file transfer, installer behavior, startup persistence, services, privilege elevation, Windows native APIs, or token handling.

## Decisions

1. Add integration coverage rather than changing `acceptedForwardAuditDetail`.
   - Rationale: the implementation already returns only bounded metadata for non-signal messages. The missing piece is an end-to-end test that proves `hello` display metadata stays out of accepted forwarding audit.
   - Alternative considered: add a new helper or branch for `hello` in runtime code. Rejected because special casing would expand behavior without need.

2. Use distinctive display and capability markers in the forwarded `hello`.
   - Rationale: marker strings make audit leakage assertions precise and easy to inspect.
   - Alternative considered: assert the audit detail object only. Rejected as too indirect on its own; negative marker assertions prove the sensitive presence metadata is absent from the full record.

## Risks / Trade-offs

- [Risk] Integration tests add a small amount of suite time. -> Mitigation: reuse the existing paired-session helper and audit sink.
- [Risk] Presence metadata is not secret in the same way as tokens or pairing codes, but it can still expose user/device context. -> Mitigation: audit remains limited to routing metadata and protocol identifiers.
