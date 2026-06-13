## Context

The managed runtime already has:

- `stop()` for general runtime shutdown.
- Host-only `disconnect()` for visible authorized host local disconnect control.
- Scheduled viewer local disconnect and viewer control prompt disconnect that currently use `stop()`.

Future viewer UI wiring needs a clearer operation for the user choosing to leave a support session locally. A dedicated `leave()` method makes that boundary explicit and testable while still using the existing local shutdown mechanics.

## Goals / Non-Goals

**Goals:**

- Add `leave(): Promise<void>` to the managed runtime.
- Allow `leave()` only on viewer runtimes.
- Make `leave()` close only the local viewer relay connection and clear local connection-scoped viewer state.
- Make viewer status after leave report inactive state with `visibleToHost=false` and `permissionCount=0`.
- Route scheduled viewer local disconnect and viewer control prompt `disconnect` through `leave()`.

**Non-Goals:**

- No protocol schema changes.
- No relay behavior changes.
- No host lifecycle control changes.
- No production auth/account changes.
- No screen capture, input injection, clipboard sync, file transfer, diagnostics collection, reconnect, installer/startup/service work, token handling changes, or privilege elevation.

## Decisions

- Keep `stop()` as the shared internal shutdown primitive and implement `leave()` as a viewer-only wrapper.
  - Rationale: this avoids duplicating timer cleanup, state reset, socket close, and close-event handling while enforcing a role-specific API at the call boundary.
  - Alternative considered: rename `stop()` to `leave()` for viewers. Rejected because `stop()` is still needed for tests, process shutdown, and host runtime cleanup.
- Update viewer CLI helpers to depend on `leave()` instead of `stop()`.
  - Rationale: scheduled viewer disconnect and viewer prompt disconnect represent a user leave action, so their dependency should expose only that semantic operation.
  - Alternative considered: leave helpers on `stop()`. Rejected because it hides the viewer-only safety boundary from future UI wiring.
- Do not send any viewer-originated protocol notice during leave.
  - Rationale: disconnect notices are relay-observed lifecycle events; viewer leave should only close the local transport and let the relay notify the host.
  - Alternative considered: send a protocol `peer-disconnected` message before close. Rejected as forged peer lifecycle messaging.

## Risks / Trade-offs

- [Risk] A future caller could confuse `leave()` with host disconnect control. -> Mitigation: role validation rejects host runtimes and tests cover the rejection path.
- [Risk] Local status could retain stale authorization after leave. -> Mitigation: `leave()` reuses connection-scoped state reset and integration tests assert inactive viewer status after leave.
- [Risk] Runtime stop failures could leak raw exception text through CLI helpers. -> Mitigation: existing CLI helper diagnostics remain sanitized.
