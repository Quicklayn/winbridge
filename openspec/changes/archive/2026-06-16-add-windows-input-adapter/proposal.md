## Why

WinBridge now has consent-bound frame capture, frame transport, and explicit
viewer frame output. MVP remote control still needs a reviewed Windows native
input boundary before the agent shell can safely apply authorized pointer or
keyboard intents on the host.

## What Changes

- Add a new `@winbridge/windows-input` package with a Windows-only adapter for
  applying one remote input event through an injectable native runner.
- Validate active visible unexpired input grants, peer connectivity, matching
  authorization id, and required permission before invoking the runner.
- Normalize pointer and keyboard event metadata into bounded runner requests.
- Keep the package side-effect free at import and construction time.
- Keep runtime wiring, CLI host input application, and production viewer UI out
  of scope for this change.

## Capabilities

### New Capabilities

- `windows-input`: defines the native Windows input adapter boundary.

### Modified Capabilities

## Impact

- Affected code: new `packages/windows-input`, root TypeScript references,
  README/architecture/roadmap/threat model/privacy documentation, and OpenSpec
  specs.
- Security impact: touches native input application boundaries and keyboard
  event handling.
- Non-goals: no runtime wiring, no hidden input, no keylogging, no credential
  access, no services/startup persistence, no privilege elevation, no AV/EDR
  evasion, and no Windows prompt bypass.
