## Why

`mvp:doctor` currently verifies that root MVP scripts exist, but it does not
detect when those scripts drift away from the reviewed MVP workflow. A
misaligned `dev:agent`, `dev:relay`, or `mvp:smoke` script can make a two-PC
trial fail after readiness appears healthy.

## What Changes

- Add read-only root script alignment validation to `mvp:doctor`.
- Fail closed with a bounded `script-misaligned` reason if critical root
  scripts stop building the required workspaces or stop running the reviewed
  helper entrypoints.
- Keep doctor output bounded and avoid echoing script bodies, paths, tokens,
  environment values, stdout, stderr, or package JSON content.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: doctor validates that root MVP scripts remain
  aligned with the reviewed development workflow before a two-PC trial.

## Impact

- Affected code: `scripts/mvp-doctor.mjs`, `scripts/mvp-doctor.test.ts`,
  README, and OpenSpec docs.
- Affected systems: local read-only readiness validation only.
- Safety impact: no process launch, relay, host, viewer, browser, capture,
  input, sockets, audit writes, native API calls, installer, startup, service,
  privilege, token, or authorization behavior changes.
- Non-goals: no automatic script execution, no remote discovery, no network
  probing, no firewall changes, no hidden sessions, no unattended access, no
  credential access, no keylogging, no Windows prompt bypass, and no production
  deployment workflow.
