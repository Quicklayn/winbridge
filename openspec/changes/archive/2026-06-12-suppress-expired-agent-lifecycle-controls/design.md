## Context

The non-native agent shell simulates host workflow messages for consent, visible activation, pause/resume, permission revocation, termination, and expiration. Pause and resume already check authorization TTL at the moment their delayed timers fire. Revocation and termination currently rely on terminal state set by the expiration timer, which can miss timer-boundary races and emit live-session lifecycle messages after `expiresAt`.

This is development workflow behavior only. It does not change relay routing, protocol schemas, production authorization storage, native Windows UI, capture, input, installer, startup, services, tokens, or privilege behavior.

## Goals / Non-Goals

**Goals:**

- Suppress delayed `permission-revoked`, revoke state, and revoke audit events when `expiresAt` has already passed.
- Suppress delayed terminate `session-control`, terminated state, and termination audit events when `expiresAt` has already passed.
- Keep expiration state and expiration audit as the winning terminal event.
- Preserve existing disconnect and terminal-state suppression behavior.

**Non-Goals:**

- No relay-side TTL state tracking.
- No new protocol message fields or schemas.
- No production account/session authorization design.
- No remote capture, input, clipboard, file transfer, diagnostics, Windows APIs, installer, service, startup, persistence, keylogging, evasion, or Windows prompt bypass changes.

## Decisions

1. Reuse the existing runtime TTL helper.

   `scheduleHostRevoke` and `scheduleHostTerminate` will call `hasAuthorizationExpired(expiresAt)` after checking terminal state and delayed-send eligibility, matching pause/resume. Alternative considered: depend entirely on the expiration timer setting `workflowState.terminalStatus`. That leaves timer-order races at the TTL boundary.

2. Suppress without sending replacement control messages.

   When revocation or termination loses to expiration, the shell logs a local summary and sends no revoke/terminate protocol or audit messages. The separate expiration timer remains responsible for the `expired` state/audit. Alternative considered: send an explicit denial audit for skipped revoke/terminate. That would add more protocol surface and could confuse the terminal lifecycle for a development simulation.

3. Keep tests at the integration level.

   The risk is message emission ordering through the managed runtime and relay. Integration tests verify what the peer observes, including absence of forbidden messages after the TTL boundary.

## Risks / Trade-offs

- Timer scheduling can be sensitive on busy machines. Mitigation: tests wait for the expired state first, then allow a small delay before checking absence of revoke/terminate messages.
- Suppressed revoke/terminate requests are local simulation behavior, not durable host intent. Mitigation: production host control persistence remains out of scope and must be specified separately.

## Migration Plan

No data migration is required. Existing valid delayed revoke and termination simulations still work before expiration; only post-expiration lifecycle controls are suppressed.

## Open Questions

None.
