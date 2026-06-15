## Why

The agent-shell runtime can now send and receive consent-bound `screen-frame` and `input-event` messages, but those paths are only reachable from tests or direct library calls. A development CLI exerciser is the next MVP step because it lets operators validate the remote-view/control message path across real host/viewer processes before native Windows capture and input adapters are added.

## What Changes

- Add host-only CLI options that schedule a single development `screen-frame` send after the host has active visible `screen:view` authorization.
- Add viewer-only CLI options that schedule a single development `input-event` send after the viewer has active visible `input:pointer` or `input:keyboard` authorization.
- Validate CLI remote interaction inputs before runtime startup, including bounded delays, dimensions, frame format, encoded frame data, input kind, pointer coordinates/buttons, keyboard key/code/modifiers, and unsafe/secret-bearing metadata.
- Keep raw frame bytes, screen contents, pointer coordinates, button values, key values, modifiers, and raw input payloads out of logs, usage diagnostics, runtime events, and audit details by reusing the dedicated runtime send methods.
- Document the development CLI flow and make clear that it is still non-native: no screen capture, viewer rendering, OS input injection, installer, service, startup persistence, elevation, unattended access, AV/EDR evasion, credential collection, keylogging, or Windows prompt bypass.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Adds explicit non-native CLI operations for exercising consent-bound development screen-frame and input-event sends through existing runtime gates.

## Impact

- Affects `apps/agent-shell/src/args.ts`, CLI startup orchestration, and focused integration/unit tests.
- Affects README and architecture/security documentation for the new development CLI flow.
- Touches input workflow boundaries, capture-data handling boundaries, authorization checks, accepted-send audit ordering, local events, logs, and diagnostics.
- Does not touch relay behavior, protocol schemas, native Windows APIs, installer behavior, services, startup persistence, tokens, privilege elevation, production authentication, clipboard, file transfer, or diagnostics collection.
