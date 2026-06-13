## Why

Host-side immediate controls are a core safety property, but the development host control prompt currently relies on the startup banner for command discovery. A bounded `help` command gives the host operator an on-demand reminder without reading runtime state or touching the remote assistance workflow.

## What Changes

- Add an exact `help` command to the interactive host control prompt.
- Print a static, secret-safe list of accepted host control commands.
- Reject malformed help input with the existing non-echoing rejection path.
- Keep `help` read-only: it must not call status snapshots, lifecycle controls, public sends, or protocol construction paths.
- Non-goals: no capture, input injection, clipboard, file transfer, diagnostics collection, authentication changes, relay changes, installer/startup behavior, service behavior, token handling, privilege elevation, or native Windows API work.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: add a host control prompt help command with strict command parsing and a read-only safety boundary.

## Impact

- Affected code: `apps/agent-shell/src/host-control-prompt.ts` and focused tests.
- Affected docs/specs: README, architecture/security notes, and the `agent-shell-consent-workflow` specification.
- APIs/dependencies: no package, protocol, relay, auth, token, installer, startup, service, logging, or privilege-elevation changes.
