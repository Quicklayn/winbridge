## Context

The agent shell is a protocol simulator shared by CLI and integration tests. It currently supports explicit host approve/deny, visible activation, permission revocation simulation, secret-safe received-message logging, and workflow audit-event messages. The protocol already includes `session-control` with `terminate` and authorization state `terminated`.

This change stays in the simulator. It does not implement native Windows UI, capture, input, clipboard, file transfer, services, startup persistence, unattended access, or production audit persistence.

## Goals / Non-Goals

**Goals:**
- Allow the host shell to simulate session termination after active visible approval.
- Send termination control, terminated authorization state, and a secret-safe audit-event.
- Ensure no termination messages are sent when approval is missing or visible active state is withheld.
- Keep timer behavior deterministic and cleared during runtime stop.

**Non-Goals:**
- No new protocol schema.
- No production host disconnect UI.
- No network reconnect/session recovery design.
- No screen capture, input, clipboard, file transfer, diagnostics export, services, startup persistence, credential access, or hidden access.

## Decisions

1. Reuse existing `session-control` and `session-authorization-state`.
   - Rationale: `session-control` already models host control actions and state update communicates fail-closed authorization status.
   - Alternative considered: add a new terminate-specific message. Rejected because the protocol already has the required surface.

2. Gate termination behind the same active visible state path as revocation.
   - Rationale: host termination is meaningful only after a session has become visibly active in this simulator. Approval without visibility must still fail closed.
   - Alternative considered: allow termination after approval without visibility. Rejected because it would imply a non-visible session state.

3. Add explicit runtime options and CLI flags.
   - Runtime options:
     - `hostTerminateAfterMs`
     - `hostTerminateReason`
   - CLI flags:
     - `--terminate-after-ms`
     - `--terminate-reason`
   - Rationale: tests can use short delays; CLI users must opt in.

4. Keep audit details secret-safe.
   - Termination audit detail includes booleans/counts/status only.
   - Raw termination reason text may be sent in protocol state/control messages but MUST NOT appear in audit-event detail or logs.

## Risks / Trade-offs

- Timer race with revoke simulation -> Both timers are explicit; tests cover termination independently, and runtime stop clears timers.
- Confusion with production disconnect -> Documentation labels this as development protocol simulation only.
- Raw reason leakage through audit/logs -> Keep audit detail centrally constructed and test for absence of private reason text in audit-event details.

## Migration Plan

1. Add runtime and CLI termination options.
2. Schedule termination after active visible state emission.
3. Emit `session-control`, terminated state, and audit-event messages.
4. Add integration tests and docs.
5. Run check, tests, build, and OpenSpec validation.

Rollback is removing the options and termination scheduling while preserving existing consent, revoke, and audit-event behavior.

## Open Questions

- Native host UI placement, one-click disconnect behavior, and production audit persistence remain future Windows-specific OpenSpec work.
