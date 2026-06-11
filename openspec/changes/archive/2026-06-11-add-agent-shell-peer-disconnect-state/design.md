## Context

The agent shell is a non-native protocol exerciser. It can simulate host consent decisions and delayed lifecycle events such as revoke, pause, resume, termination, and expiration, but it does not perform remote actions.

The relay now emits `peer-disconnected` when a registered peer leaves. The agent shell receives this message through the existing protocol parser and event stream, but delayed host timers only check the local WebSocket state. Because the host remains connected to the relay after the viewer disconnects, timers can still send stale lifecycle messages.

## Goals / Non-Goals

**Goals:**

- Record peer disconnect state when a `peer-disconnected` message is received.
- Log a secret-safe disconnect summary with peer id, role, and bounded reason code.
- Suppress delayed host workflow simulation messages after a remote peer disconnects.
- Keep received disconnect handling separate from authorization grants and remote actions.

**Non-Goals:**

- Reconnect behavior, relay changes, production presence, native Windows UI, screen capture, remote input, clipboard, file transfer, installer/service behavior, startup persistence, credential access, privilege elevation, hidden sessions, or Windows security prompt bypass.

## Decisions

1. Store runtime-local peer disconnect state.
   - Rationale: delayed workflow timers need a shared state check independent of WebSocket open/closed state.
   - Alternative considered: close the host shell socket immediately after peer disconnect. Rejected because the relay connection can still be useful for test observability and explicit local shutdown.

2. Treat peer disconnect as fail-closed for delayed host workflow simulation.
   - Rationale: stale revocation, pause, resume, termination, or expiration messages after the peer has left do not represent an active assistance workflow.
   - Alternative considered: keep sending lifecycle messages for audit simulation. Rejected because it blurs the session lifecycle boundary after disconnect.

3. Keep disconnect logs summary-only.
   - Rationale: `peer-disconnected` contains only bounded fields, and logs should remain aligned with the existing no-raw-payload policy.
   - Alternative considered: log the full protocol envelope. Rejected because the agent shell intentionally avoids raw protocol payload logs.

## Risks / Trade-offs

- [Risk] Suppressing delayed messages could hide a host-side local event in development tests. -> Mitigation: this applies only after a relay-confirmed peer disconnect and emits a safe skip log.
- [Risk] Future reconnect semantics may need more nuanced state. -> Mitigation: reconnect remains out of scope and must be specified in a future OpenSpec change.
- [Risk] Disconnect state could be mistaken for authorization state. -> Mitigation: it does not grant permissions or send authorization messages; it only suppresses delayed simulation.
