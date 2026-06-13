## Why

Injected relay heartbeat settings are validated before the relay accepts peers, but the normalized config is currently the same caller-owned object. A test or embedding caller can mutate that object after validation, which can change heartbeat timer behavior without passing through the safety checks.

## What Changes

- Treat validated heartbeat interval and timeout settings as an internal immutable snapshot.
- Ensure caller mutations after `normalizeRelayHeartbeatConfig()` or `createRelayRuntime({ heartbeat })` cannot change the relay's heartbeat timers.
- Preserve existing defaults, enabled/disabled flag behavior, and safe timer bounds.
- Add focused tests for snapshot isolation and runtime-level caller mutation.
- Non-goals: no production liveness service, no reconnect policy, no capture/input behavior, no installer/startup/service behavior, no token/auth changes, and no consent or authorization semantic changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `relay-heartbeat`: injected heartbeat timer settings are copied into a validated snapshot before use.
- `relay-runtime`: managed relay heartbeat configuration cannot be mutated by the caller after runtime creation.

## Impact

- Affected code: `apps/relay/src/heartbeat.ts`, relay heartbeat/runtime tests, and OpenSpec specs.
- Affected systems: development relay liveness configuration for programmatic callers and tests.
- Safety impact: keeps relay stale-peer timeout behavior bound to validated configuration and avoids fail-open or timer-unsafe post-validation mutation.
- Security review: required because this touches relay networking/liveness behavior.
