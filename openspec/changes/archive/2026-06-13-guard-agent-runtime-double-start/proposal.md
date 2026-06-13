## Why

The managed agent shell runtime can be asked to `start()` more than once while its WebSocket is still connecting or open. That can create multiple local relay transports for one runtime and peer identity, making consent workflow state harder to reason about.

## What Changes

- Reject a second `start()` call while the same managed runtime already has a connecting, open, or closing WebSocket.
- Keep manual restart after a fully closed/stopped connection valid, because a fresh `start()` already resets connection-scoped state.
- Ensure the rejected duplicate start does not open another WebSocket, send join/hello/authorization/signal/audit messages, emit local protocol events, grant permissions, activate host visibility, reconnect peers, or alter existing runtime state.
- Document the lifecycle guard in developer-facing docs.
- Keep the change local to the non-native agent shell runtime; it does not alter protocol messages, relay routing, capture, input, clipboard, file transfer, installer behavior, startup behavior, services, tokens, logs, or privilege elevation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Managed runtime lifecycle rejects duplicate active `start()` calls.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`, focused runtime integration tests.
- Affected docs/specs: `openspec/specs/agent-shell-consent-workflow/spec.md`, `docs/architecture.md`.
- Safety impact: prevents accidental duplicate local transport setup for the same runtime and peer identity. No screen capture, input, clipboard, files, native Windows APIs, installer, startup, service, token, log, authentication, authorization-state-machine, relay-routing, or privilege behavior is added or weakened.
