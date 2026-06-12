## Why

`WINBRIDGE_RELAY_HEARTBEAT_ENABLED` controls whether the development relay schedules liveness checks. Accepting padded values such as ` false ` makes this safety-adjacent startup flag ambiguous compared with the relay's already exact numeric heartbeat configuration.

## What Changes

- Require configured `WINBRIDGE_RELAY_HEARTBEAT_ENABLED` values to be one of `true`, `false`, `yes`, `no`, `1`, or `0` with no leading or trailing whitespace.
- Preserve the existing default: omitting `WINBRIDGE_RELAY_HEARTBEAT_ENABLED` keeps relay heartbeat enabled.
- Preserve the existing accepted canonical flag values and their current meanings.
- **BREAKING**: development configurations that set padded heartbeat enabled values such as ` false ` will fail at relay startup instead of being trimmed.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `relay-heartbeat`: heartbeat enabled environment configuration must reject untrimmed or otherwise non-canonical flag values before accepting peers or scheduling heartbeat timers.

## Impact

- Affected code: `apps/relay/src/heartbeat.ts`, `apps/relay/src/heartbeat.test.ts`, and `apps/relay/src/server.integration.test.ts`.
- Affected docs/specs: relay heartbeat sections in OpenSpec, README, architecture, and security model docs.
- Safety impact: touches relay startup/liveness configuration only. It does not add or change screen capture, remote input, clipboard, file transfer, installer behavior, startup persistence, services, privilege elevation, Windows native APIs, token handling, production authentication, or authorization semantics.
