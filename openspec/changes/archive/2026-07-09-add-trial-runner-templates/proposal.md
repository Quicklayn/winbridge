## Why

The current two-PC trial plan references the command kit and LAN probes, but it does not directly show the reviewed foreground `mvp:run` commands that operators use to start relay, host, and viewer roles. Adding fixed role-runner templates closes that manual translation gap before MVP trials while preserving the non-executing safety boundary.

## What Changes

- Add fixed `mvp:run` command-reference templates to the relay, host, and viewer sections of `mvp:trial`.
- Keep `mvp:trial` non-executing: it prints only reviewed command references with `<session-id>`, `<pairing-code>`, and relay-host placeholders or a validated relay host.
- Extend `mvp:ready` trial-plan validation so drift in the new runner templates fails closed.
- Update tests and README documentation for the trial workflow.
- No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: The two-PC trial plan and readiness validation require reviewed non-executing `mvp:run` role-runner templates.

## Impact

- Affected code: `scripts/mvp-trial.mjs`, `scripts/mvp-ready.mjs`, and their focused tests.
- Affected docs/specs: README and `mvp-session-command-kit` requirements.
- Security impact: touches relay token reference handling and operator launch guidance, but does not read token values, start processes, open sockets, capture screens, apply input, install services, configure startup persistence, elevate privileges, or hide sessions.
- Non-goals: no production desktop UI, no automatic orchestration, no browser launch, no unattended access, no hidden background process manager, no relay deployment, and no change to Windows capture/input authorization behavior.
