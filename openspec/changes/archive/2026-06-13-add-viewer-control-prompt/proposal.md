## Why

The viewer side already has one-shot local status and local disconnect helpers, but future viewer UI wiring needs an interactive development surface that can exercise those local-only controls repeatedly. Adding a viewer control prompt closes that gap without adding remote action capability.

## What Changes

- Add an opt-in viewer-only CLI flag `--viewer-control-prompt true`.
- Add an interactive viewer prompt with exact commands `status` and `disconnect`.
- `status` prints the existing bounded viewer status snapshot and does not send protocol messages.
- `disconnect` stops only the local viewer runtime and relies on the relay to notify the host.
- Reject malformed, host-mode, or ambiguous viewer control prompt configuration before runtime startup.
- Keep prompt output secret-safe and avoid echoing raw command lines.
- Non-goals: no screen capture, input injection, clipboard/file transfer, diagnostics collection, reconnect, hidden session behavior, host lifecycle controls, protocol message forging, installer/startup/service behavior, token handling changes, or privilege elevation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Adds viewer-only interactive local status and local disconnect prompt behavior.

## Impact

- Affected code: `apps/agent-shell/src/args.ts`, `apps/agent-shell/src/index.ts`, new viewer control prompt module and tests.
- Affected docs: README and architecture/security documentation for the development agent shell.
- Affected safety surface: user-visible development CLI workflow only.
- Not touched: protocol schemas, relay behavior, capture, input, auth, installer, startup, services, tokens, logs, or privilege elevation.
