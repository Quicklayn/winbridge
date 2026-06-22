## Why

WinBridge now has consent-bound Windows capture, viewer frame persistence, and
interactive terminal input commands, but the development MVP still requires
operators to watch an output file and type normalized coordinates manually. A
local viewer surface can make the MVP usable for end-to-end Windows assistance
without changing the consent, visibility, audit, or host revocation model.

## What Changes

- Add an opt-in viewer-only local control surface served on loopback
  (`127.0.0.1`) from the agent shell.
- Display the latest authorized screen frame from the already explicit
  `--viewer-screen-frame-output` path.
- Accept bounded pointer and keyboard commands from the local browser surface
  and route them through the existing `runtime.sendInputEvent()` path.
- Require the same active visible authorization and permissions as the terminal
  viewer control prompt before any input event can be sent.
- Keep HTTP responses, UI status, logs, and audit output metadata-only and avoid
  echoing raw keys, pointer coordinates, frame bytes, tokens, pairing codes, or
  private reasons in diagnostics.
- Keep public exposure, remote HTTP access, unattended access, hidden sessions,
  clipboard, file transfer, remote shell, service/startup changes, privilege
  elevation, AV/EDR evasion, Windows prompt bypass, and credential collection
  out of scope.

## Capabilities

### New Capabilities

### Modified Capabilities

- `agent-shell-consent-workflow`: extend the viewer CLI workflow with a
  loopback-only local control surface for authorized frame viewing and explicit
  input sends.

## Impact

- Affected code: `apps/agent-shell` argument parsing, CLI startup, local viewer
  surface module, viewer prompt input parsing reuse, tests, README, and OpenSpec
  specs.
- Security impact: touches viewer local HTTP command input, input sends,
  screen-frame display, authorization status, metadata-only diagnostics, logs,
  and remote host native input reachability when the host explicitly opted in.
- Non-goals: no externally reachable viewer server, hidden input, keylogging,
  free-form text typing buffers, command macros, clipboard, file transfer,
  diagnostics collection, installer/service/startup behavior, privilege
  elevation, unattended access, AV/EDR evasion, Windows prompt bypass, or
  credential collection.
