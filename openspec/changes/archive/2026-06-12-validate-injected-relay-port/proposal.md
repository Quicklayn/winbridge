## Why

The relay CLI validates `WINBRIDGE_RELAY_PORT` before constructing the managed runtime, but tests and programmatic callers can still pass an unsafe `port` option directly to `createRelayRuntime`. The relay runtime spec says malformed port configuration should be rejected before opening a listening socket, so direct runtime options should fail fast with the same bounded local validation.

## What Changes

- Validate injected `RelayRuntimeOptions.port` before creating the HTTP/WebSocket listener.
- Reject non-number, non-integer, negative, fractional, `NaN`, infinite, or out-of-range port values.
- Preserve valid ports, including `0` for ephemeral test ports and `8787` as the default.
- Add focused relay runtime tests for unsafe injected port values.
- Update docs/specs to clarify both environment-derived and injected runtime ports are bounded.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `relay-runtime`: managed runtime port validation covers direct injected options, not only CLI environment parsing.

## Impact

- Affected code: relay runtime option validation and relay runtime tests.
- Affected docs/specs: relay architecture/security docs and OpenSpec relay-runtime spec.
- Affected systems: local development relay startup through tests or programmatic callers.
- Safety impact: prevents malformed or surprising port values from reaching network binding. This does not add capture, input, clipboard sync, file transfer, diagnostics export, installer, startup, service, credential collection, or privilege behavior.
