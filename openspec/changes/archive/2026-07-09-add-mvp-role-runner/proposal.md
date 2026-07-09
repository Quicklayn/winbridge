## Why

The two-PC MVP workflow now produces reviewed role commands, but operators
still have to copy long PowerShell command blocks by hand. A small foreground
role runner can reduce trial setup mistakes while preserving explicit host
consent, visible terminals, and fail-closed validation.

## What Changes

- Add a root `npm run mvp:run -- --role relay|host|viewer` helper that derives
  one reviewed role command from `mvp:commands` semantics and starts it in the
  current foreground terminal.
- Require explicit `--session`, `--pairing`, and relay selection for every
  runner invocation so each machine uses coordinated values from one bootstrap
  plan.
- Require `--i-understand-foreground` to make process startup explicit and
  reject hidden/background/service/persistence behavior.
- Add bounded `--dry-run` and `--json` modes for review and readiness checks
  without starting child processes.
- Update doctor/readiness/docs/tests so the runner is discoverable and drift is
  caught.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: add a reviewed foreground role runner for
  executing one relay, host, or viewer command from the MVP command workflow.

## Impact

- Affected code: new `scripts/mvp-role-runner.mjs` and tests, `package.json`,
  `scripts/mvp-doctor.mjs`, `scripts/mvp-ready.mjs`, README, and OpenSpec
  artifacts.
- Touches relay/host/viewer process launch workflow, token environment
  references, local audit/frame paths, and visible consent/capture/input
  runtime options already present in reviewed role commands.
- Does not add production auth, unattended access, background services, startup
  persistence, installer behavior, privilege elevation, hidden sessions,
  hidden capture, hidden input, credential access, keylogging, AV/EDR evasion,
  Windows prompt bypass, clipboard, file transfer, diagnostics retrieval, or
  remote shell behavior.
