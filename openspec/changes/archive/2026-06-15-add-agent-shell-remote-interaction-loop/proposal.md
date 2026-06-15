## Why

WinBridge now has validated `screen-frame` and `input-event` protocol envelopes and relay forwarding gates, but the agent shell still cannot exercise those messages end to end. The next MVP step is a safe development loop that proves remote-view/control intent only flows after explicit host consent, visible authorization, and revocation-aware runtime checks.

## What Changes

- Add agent-shell runtime APIs for sending development `screen-frame` and `input-event` messages through the existing relay connection.
- Gate every local send and inbound remote-interaction acceptance on the current active, visible, unexpired authorization state and granted permission scope.
- Add metadata-only development audit records for accepted local remote-interaction sends before socket writes.
- Redact frame bytes, screen contents, pointer coordinates, button values, key names, modifiers, and raw payloads from runtime events, logs, and diagnostics.
- Keep native Windows capture, native input injection, rendering UI, installer, service, startup persistence, unattended access, elevation, and Windows prompt bypass out of scope.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Adds consent-bound, non-native remote interaction send/receive behavior to the development agent shell.

## Impact

- Affects `apps/agent-shell/src/runtime.ts` public runtime APIs, runtime event redaction, authorization gates, audit behavior, and integration tests.
- Affects architecture/security documentation to clarify that the loop is a non-native development exerciser and not real Windows capture/input.
- Touches capture and input workflow boundaries, authorization checks, logs, and audit metadata.
- Does not touch relay protocol contracts, native Windows APIs, installer behavior, services, startup persistence, tokens, or privilege elevation.
