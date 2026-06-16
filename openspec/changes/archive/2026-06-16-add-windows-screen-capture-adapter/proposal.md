## Why

WinBridge has consent-bound `screen-frame` protocol paths, but it still lacks a
Windows host-side capture boundary that can produce real frames for an MVP remote
viewing loop. Adding the adapter as a separate package lets later host runtime
integration use a reviewed, testable capture primitive instead of embedding
native behavior directly in the agent shell.

## What Changes

- Add a Windows-only screen capture adapter package that returns bounded PNG
  frames with width, height, capture timestamp, byte length, and base64 data.
- Require callers to pass an explicit active visible capture grant before any
  capture command is invoked.
- Validate capture bounds, process platform, command output, and payload size
  before returning a frame.
- Keep the adapter out of CLI auto-start paths in this change; no streaming,
  relay forwarding, viewer rendering, input injection, installer, service,
  startup persistence, or elevation behavior is added.
- Add focused unit tests that mock the native command runner and verify fail
  closed behavior without taking a real screenshot.

## Capabilities

### New Capabilities

- `windows-screen-capture`: Windows host-side capture adapter boundary for
  consent-gated MVP screen frames.

### Modified Capabilities

- `safety-boundaries`: Permit reviewed visible-session screen capture only after
  explicit host consent, while preserving the prohibition on hidden capture.

## Impact

- Affected code: new `packages/windows-capture` npm workspace, root TypeScript
  references, package lock/workspace metadata, and focused tests.
- Native surface: invokes a Windows PowerShell/.NET screenshot command only when
  called with an explicit active visible capture grant.
- Security impact: touches screen capture and logs/diagnostics; requires
  OpenSpec validation and security review before archive.
- Non-goals: no input, clipboard, file transfer, diagnostics collection,
  unattended access, hidden sessions, service installation, startup persistence,
  privilege elevation, AV/EDR evasion, Windows prompt bypass, CLI streaming
  integration, or viewer UI rendering.
