## Why

Local `npm test` already runs Vitest serially per file to reduce Windows worker instability, but the runner currently retries any failed test file once. That helps transient `ERR_IPC_CHANNEL_CLOSED` failures, yet it can also rerun real assertion failures and make the test gate less precise.

## What Changes

- Limit the runner retry path to recognized transient Vitest IPC channel-closed failures.
- Preserve serial per-file Vitest execution with the forks worker pool and isolation enabled.
- Add focused tests for retry classification and Vitest invocation policy.
- Keep product remote-assistance behavior unchanged.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-orchestration`: tighten the stable local test runner requirement so retries are bounded to recognized transient IPC worker failures and non-transient test failures fail immediately.

## Impact

- Affected code: `scripts/run-tests.mjs` and a small testable runner policy helper.
- Affected tests: new unit coverage for test-runner retry classification and command construction.
- Affected docs/specs: `agent-orchestration` OpenSpec requirement.
- This change does not touch capture, input, authentication, relay routing, installer behavior, startup behavior, services, tokens, production logs, or privilege elevation.
