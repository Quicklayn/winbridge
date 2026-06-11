## Why

The protocol and relay now support consent-bound session authorization messages, but the non-native agent shell only sends join and hello messages. A development consent workflow simulator is needed so host/viewer flows can be exercised end to end before native Windows UI exists.

## What Changes

- Refactor `apps/agent-shell` into a testable runtime with explicit start/stop lifecycle.
- Add viewer behavior to send `session-authorization-request` after joining when requested permissions are provided.
- Add host behavior to send `session-authorization-decision` and `session-authorization-state` only when an explicit host decision option is provided.
- Require `visibleToHost` to be true before the host shell emits an active state.
- Add integration tests using the real relay runtime and two agent-shell runtimes.

Safety impact:

- This change touches consent workflow simulation and authorization protocol messages.
- It does not add screen capture, input, clipboard, file transfer, installer, startup, services, privilege elevation, or unattended access.
- Approval is never implicit; the host shell only approves when started with an explicit development flag.

## Capabilities

### New Capabilities
- `agent-shell-consent-workflow`: Development-only host/viewer authorization workflow simulation over the relay.

### Modified Capabilities

None.

## Impact

- Updates `apps/agent-shell` runtime and CLI.
- Adds integration tests with `apps/relay` runtime.
- Updates docs to explain the development consent workflow.
- Adds archived OpenSpec change artifacts and active `agent-shell-consent-workflow` spec after archive.
