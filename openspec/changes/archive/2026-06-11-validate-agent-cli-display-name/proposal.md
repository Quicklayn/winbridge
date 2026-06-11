## Why

The agent shell already sends device identity metadata when joining the relay, and the shared protocol schema requires display names to be non-empty and bounded. Today `--name` is not validated by CLI parsing, so malformed display names can fail only after the runtime starts and opens a relay connection.

## What Changes

- Validate agent shell `--name` values during argument parsing.
- Reject empty, whitespace-only, or oversized display names before starting the runtime or connecting to the relay.
- Preserve omitted `--name` behavior by continuing to generate the existing development default display name.
- Preserve valid non-blank display names exactly instead of trimming them.
- Non-goals: no production identity, no account authentication, no native Windows UI, no capture/input implementation, no service installation, no startup persistence, and no authorization semantic changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: CLI argument validation rejects malformed display names before runtime startup.

## Impact

- Affected code: `apps/agent-shell/src/args.ts`, agent shell argument tests, README/security documentation, and OpenSpec specs.
- Affected systems: development agent shell CLI and local device identity metadata validation.
- Safety impact: reduces ambiguous or malformed identity metadata and keeps validation fail-fast before relay connection.
- This change touches identity/user-visible workflow only; it does not touch capture, input, auth, relay, installer, startup, services, tokens, logs, or privilege elevation.
