## Why

The MVP smoke workflow verifies consent-bound relay, frame, signal, input,
audit, lifecycle denial, and local viewer surface readiness. It should also
prove that the host process exposes a visible active-session indicator marker
during the local smoke run, because host visibility is a core safety invariant
before a two-PC trial.

## What Changes

- Add a bounded smoke subcheck that waits for the host process output to
  contain an active visible host indicator marker.
- Report this as fixed safe `indicator` subcheck metadata in smoke and ready
  outputs.
- Keep diagnostics bounded; do not print raw host output, authorization ids, or
  process logs.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: MVP smoke and ready helpers verify host visible
  indicator readiness.

## Impact

- Affected code: `scripts/mvp-session-smoke.mjs`,
  `scripts/mvp-session-smoke.test.ts`, `scripts/mvp-ready.mjs`,
  `scripts/mvp-ready.test.ts`, README, and OpenSpec documentation.
- Affected systems: same-machine development smoke and ready workflows only.
- Safety impact: visibility verification only. The change does not add native
  capture, OS input, auth bypass, relay production behavior, installer,
  startup, service, token exposure, privilege elevation, hidden sessions,
  unattended access, evasion, or Windows prompt bypass behavior.
- Non-goals: no production tray/window indicator, no browser automation, no
  desktop UI, no clipboard/file transfer/diagnostics, no remote host discovery,
  and no new permission type.
