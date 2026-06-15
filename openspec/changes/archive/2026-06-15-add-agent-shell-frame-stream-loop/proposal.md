## Why

WinBridge needs a repeatable frame transport loop before a native Windows capture adapter can be useful. The current agent shell can send only one development `screen-frame`, which proves the message path but does not exercise frame cadence, sequence handling, stop behavior, or authorization loss during a stream.

## What Changes

- Add a host-only non-native development frame stream mode to the agent shell CLI.
- Reuse the existing schema-valid static frame payload options and dedicated `sendScreenFrame()` runtime method.
- Add bounded stream controls for frame count and interval; there is no indefinite default stream.
- Stop the stream on authorization loss, runtime rejection, disconnect, stop, or configured frame count completion.
- Preserve metadata-only diagnostics, runtime events, logs, and audit records.
- Keep native Windows capture, rendering, input injection, services, startup persistence, elevation, reconnect, clipboard, file transfer, diagnostics collection, and unattended access out of scope.

## Capabilities

### New Capabilities

### Modified Capabilities

- `agent-shell-consent-workflow`: add consent-bound host development frame streaming requirements for repeated non-native `screen-frame` sends.

## Impact

- Affected code: `apps/agent-shell` argument parsing, development remote interaction scheduler, CLI startup/shutdown wiring, and tests.
- Affected docs/specs: README, roadmap, and `agent-shell-consent-workflow`.
- Safety impact: touches remote assistance frame transport, authorization, audit, diagnostics, and logs; does not touch native Windows APIs, input injection, installer, service, startup persistence, token handling, or privilege elevation.
