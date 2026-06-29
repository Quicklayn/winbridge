## Why

The command kit now has an all-smoke readiness gate available, but generated
MVP command plans still only print the older basic smoke preflight. Operators
preparing a two-PC trial should see the full local smoke gate directly in the
generated workflow.

## What Changes

- Add a printed `mvp:ready -- --include-all-smoke` preflight instruction to
  full and preflight-only command-kit output.
- Add a JSON command entry for the all-smoke readiness gate.
- In token-env command plans, print a bounded environment-reference prefix so
  the all-smoke gate can use `WINBRIDGE_RELAY_SHARED_TOKEN` without exposing a
  token value.
- Update ready command-plan validation to require the all-smoke preflight entry.
- Non-goals: no process execution, no relay/host/viewer startup, no capture,
  no input application, no browser automation, no installer, no service,
  no startup persistence, no unattended access, no privilege elevation,
  no credential access, no keylogging, no AV/EDR evasion, no Windows prompt
  bypass, and no hidden sessions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: Generated command plans include the full local
  all-smoke readiness gate and validate its presence.

## Impact

- Affected code: `scripts/mvp-session-commands.mjs`,
  `scripts/mvp-session-commands.test.ts`, `scripts/mvp-ready.mjs`,
  `scripts/mvp-ready.test.ts`, `README.md`.
- Affected systems: non-executing MVP command rendering, JSON command-plan
  output, and local readiness validation.
- Security impact: touches token references and generated diagnostics only. It
  must not print token values, child output, stdout, stderr, credentials, screen
  contents, input contents, clipboard contents, or full secrets.
