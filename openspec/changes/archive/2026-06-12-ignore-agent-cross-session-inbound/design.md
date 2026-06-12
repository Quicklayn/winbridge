## Context

Agent-shell is a non-native development exerciser. It receives protocol envelopes over WebSocket, emits local redacted runtime events, and may simulate host consent decisions when explicitly configured. The normal relay path already validates session membership before forwarding, but the runtime should avoid trusting every decoded envelope from an arbitrary relay-like endpoint.

## Goals / Non-Goals

**Goals:**

- Check decoded inbound protocol envelopes against the local runtime `sessionId` before local `received` events or workflow handling.
- Treat cross-session inbound protocol envelopes as ignored input with redacted metadata only.
- Prevent cross-session authorization requests from triggering host decisions, state updates, audit events, pause/resume/revoke/terminate scheduling, or local received protocol events.

**Non-Goals:**

- No production relay trust, account identity, MFA, RBAC, reconnect, or device trust design.
- No change to relay forwarding behavior.
- No change to protocol envelope schemas.
- No changes to capture, input, clipboard, file transfer, diagnostics, installer, startup, service, persistence, privilege elevation, or Windows prompt behavior.

## Decisions

1. Validate inbound session after protocol decoding and before local event emission.
   - Rationale: decoded envelopes can be safely inspected for `sessionId`, and rejecting before `received` events prevents local observers from treating cross-session messages as accepted workflow input.
   - Alternative considered: emit a `received` event and skip workflow handling. Rejected because it makes ignored cross-session input look like accepted local session traffic.

2. Reuse the existing redacted `raw` event shape for ignored cross-session input.
   - Rationale: it already exposes only `[REDACTED]` plus byte length and avoids adding a broader public event type for malformed or untrusted inbound data.
   - Alternative considered: add a new event type. Rejected to keep this hardening small and avoid expanding event consumers before native UI work.

3. Log only bounded summary text.
   - Rationale: cross-session messages might contain private workflow reasons or signal payloads. Logs should expose that input was ignored without echoing message type, ids, reasons, or payload content.

## Risks / Trade-offs

- Tests or local fake relays that intentionally send mismatched session ids will no longer produce `received` events. Mitigation: use matching session ids for valid local workflow tests.
- This does not replace relay-side session enforcement. Mitigation: relay authority checks remain the primary broker boundary; agent-shell adds defense-in-depth for local development runtime behavior.

## Migration Plan

No migration is required for valid relay flows. Local test servers must send protocol envelopes with the same session id as the agent-shell runtime when they expect normal workflow handling.

## Open Questions

None.
