# Security Review

Reviewed scope: command-kit rendering and readiness validation for the
`preflight.ready-all-smoke` command-plan entry.

Findings:

- The change remains non-executing. It only prints command text or JSON command
  metadata and does not start relay, host, viewer, browser, capture, input, or
  network processes.
- Raw token values remain rejected by the command kit. The new all-smoke
  command uses only `$env:<NAME>` references when `--token-env` is provided.
- The default all-smoke instruction names `WINBRIDGE_RELAY_SHARED_TOKEN` but
  does not read or print its value.
- `mvp:ready` now fails closed if the fixed `preflight.ready-all-smoke` entry
  is missing from JSON command plans, and token-plan readiness requires the
  reviewed all-smoke environment-reference command.
- No hidden sessions, unattended access, persistence, privilege elevation,
  credential access, keylogging, AV/EDR evasion, or Windows prompt bypass paths
  were added.

Residual risk:

- Operators still need to set the relay token explicitly before running
  all-smoke coverage. This is documented and the generated command text avoids
  printing the token value.
