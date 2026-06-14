## Why

Heartbeat timeout cleanup is a relay liveness and safety boundary: a stale peer must be removed even when observability fails. Today the timeout path writes `relay.peer.heartbeat.timeout` before terminating the socket, so an audit sink exception can prevent the stale peer from being terminated and from entering normal close cleanup.

## What Changes

- Treat `relay.peer.heartbeat.timeout` audit persistence as best-effort observability after the timeout decision.
- Ensure heartbeat timeout termination and normal close cleanup still run when timeout audit persistence fails.
- Emit only a bounded relay warning for heartbeat timeout audit failures, and contain logger failures while reporting that warning.
- Add integration coverage proving disconnect notices and cleanup survive heartbeat timeout audit and logger failures.
- No breaking changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `relay-heartbeat`: heartbeat timeout audit failure must not prevent timeout termination, close cleanup, bounded peer disconnect notification, or secret-safe diagnostics.

## Impact

- Affected code: `apps/relay/src/server.ts`, `apps/relay/src/server.integration.test.ts`.
- Affected systems: development WebSocket relay heartbeat, relay audit, relay diagnostics/logs.
- Safety impact: strengthens fail-closed cleanup for stale relay peers and keeps diagnostics bounded. This does not grant permissions, approve sessions, start capture, send input, suppress host visibility, or bypass consent.
- Touches: relay and logs.
- Does not touch: capture, input, auth, installer, startup, services, tokens, native Windows APIs, privilege elevation, persistence, or host consent UI.
- Non-goals: no covert access, hidden sessions, stealth persistence, credential collection, keylogging, AV/EDR evasion, or Windows prompt bypass.
