## Context

The agent shell is a non-native protocol exerciser shared by the CLI and tests. It currently sends join/hello, lets a viewer request permissions, and lets a host explicitly approve or deny. When approval is visible, the host emits an active session state. The shared protocol already contains `permission-revoked` and `session-authorization-state`, so the missing piece is development runtime behavior that exercises those messages.

This change remains in the protocol simulator layer. It does not implement native Windows capture, input, clipboard, file transfer, services, startup persistence, or unattended access.

## Goals / Non-Goals

**Goals:**
- Allow tests and CLI users to configure host-side permission revocation after active visible approval.
- Send revocation messages only after explicit host approval and visible session state were emitted.
- Model partial revoke and full revoke outcomes through state updates.
- Keep behavior deterministic for integration tests.

**Non-Goals:**
- No production host UI or native Windows controls.
- No screen capture, keyboard/pointer input, clipboard, file transfer, diagnostics export, or remote action execution.
- No protocol schema changes.
- No hidden or automatic approval path.

## Decisions

1. Reuse existing protocol messages.
   - Rationale: `permission-revoked` identifies the revoked permission and actor, while `session-authorization-state` communicates remaining permission state.
   - Alternative considered: add a new revoke workflow message. Rejected because the current protocol already covers this development scenario.

2. Gate revoke scheduling behind active visible state emission.
   - Rationale: the host should not simulate revocation of a session that never became visibly active. This preserves the current visible active state gate and avoids implying invisible authorization.
   - Alternative considered: schedule revoke immediately after an approved decision. Rejected because approval without visibility still blocks active state.

3. Add explicit runtime options and CLI flags.
   - Runtime options:
     - `hostRevokeAfterMs`
     - `hostRevokePermission`
     - `hostRevokeReason`
   - CLI flags:
     - `--revoke-after-ms`
     - `--revoke-permission`
     - `--revoke-reason`
   - Rationale: tests can run quickly with short timers, while CLI users must opt into revocation simulation.

4. Keep revocation local to host-side simulation state.
   - Rationale: the shell does not maintain production authorization stores. It can compute remaining permissions from the request it just approved and send a state update.
   - Alternative considered: introduce full state machine persistence in agent-shell. Rejected for this small development simulator increment.

## Risks / Trade-offs

- Timer flakiness in integration tests -> Use small deterministic timers only after observed active state and wait on received protocol messages.
- Confusion with production revocation -> Document this as development simulation only.
- Partial revoke semantics may differ from future UI -> Keep protocol-compatible messages and leave production UX for a future OpenSpec change.
- Revoke configured without visible approval -> Runtime logs and does nothing, preserving fail-closed consent behavior.

## Migration Plan

1. Add runtime and CLI revoke options.
2. Schedule revoke after active visible state emission.
3. Add integration tests for full revoke and no revoke when visible state is withheld.
4. Update docs.
5. Validate with check, tests, build, and OpenSpec.

Rollback is removing the runtime options, CLI flags, and tests while preserving existing request/decision/active behavior.

## Open Questions

- Future native host UI should define immediate manual revoke controls, audit persistence, and viewer notification copy in a separate Windows UI OpenSpec change.
