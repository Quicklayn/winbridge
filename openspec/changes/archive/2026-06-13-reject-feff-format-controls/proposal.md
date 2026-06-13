## Why

The existing validators reject Unicode bidi controls and common zero-width controls, but omit `U+FEFF` (zero-width no-break space / BOM) in display-name and development token paths. This leaves an invisible formatting character accepted in values that specs already describe as zero-width-control-safe.

## What Changes

- Treat `U+FEFF` as an unsafe zero-width formatting control for protocol display-name metadata.
- Treat `U+FEFF` as an unsafe zero-width formatting control for development relay shared tokens and agent relay tokens.
- Add regression tests that prove `U+FEFF` is rejected without exposing raw display names or token text in diagnostics.
- Update OpenSpec requirements to explicitly include zero-width formatting controls where display-name requirements currently mention only bidirectional controls.
- Non-goals: no screen capture, input injection, clipboard sync, file transfer, native Windows API work, installer/startup/service behavior, persistence, privilege elevation, or production authentication changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `identity-pairing`: Device identity display names reject zero-width formatting controls including `U+FEFF`.
- `session-broker`: `hello` display names reject zero-width formatting controls including `U+FEFF`; development relay shared tokens continue to reject zero-width controls explicitly.
- `session-authorization-protocol`: Legacy consent request display names reject zero-width formatting controls including `U+FEFF`.
- `agent-shell-consent-workflow`: CLI, direct runtime, inbound `hello`, and public-send `hello` display-name validation reject zero-width formatting controls; runtime and CLI relay tokens reject `U+FEFF`.
- `relay-runtime`: Relay shared-token configuration rejects `U+FEFF` before opening a listener or accepting peers.

## Impact

- Affected code: `packages/protocol/src/identity.ts`, protocol tests, agent-shell argument/runtime tests and validators, relay shared-token tests and validator.
- Affected systems: development relay token configuration, agent relay token configuration, protocol display-name validation, and secret-safe diagnostics for rejected malformed values.
- Safety impact: narrows accepted metadata/token values and strengthens existing spoofing/log-safety boundaries. The change touches relay and token handling, so it requires security review before release.
