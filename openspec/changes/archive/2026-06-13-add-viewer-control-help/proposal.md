## Why

The viewer control prompt now has repeated local commands for status and disconnect, but command discovery is limited to the initial banner. A static `help` command gives the viewer operator an on-demand reminder while preserving the local-only safety boundary.

## What Changes

- Add an exact `help` command to the interactive viewer control prompt.
- Print a static, secret-safe list of accepted viewer control prompt commands.
- Reject malformed help input through the existing non-echoing rejection path.
- Keep `help` read-only: it must not call viewer status, viewer leave, host controls, public sends, or protocol construction paths.
- Non-goals: no capture, input injection, clipboard, file transfer, diagnostics collection, authentication changes, relay changes, installer/startup behavior, service behavior, token handling, privilege elevation, or native Windows API work.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: add a viewer control prompt help command with strict command parsing and a read-only safety boundary.

## Impact

- Affected code: `apps/agent-shell/src/viewer-control-prompt.ts` and focused tests.
- Affected docs/specs: README, architecture/security notes, and the `agent-shell-consent-workflow` specification.
- APIs/dependencies: no package, protocol, relay, auth, token, installer, startup, service, logging, or privilege-elevation changes.
