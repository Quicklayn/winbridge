## Why

The evidence fixture readiness gate now exists, but the two-PC operator
workflow still does not surface it in the reviewed preflight sequence. Adding
that reference makes it harder to skip the dry-run proof that strict post-run
evidence validation is wired before a live MVP trial.

## What Changes

- Add the explicit `mvp:ready -- --include-evidence-fixture` dry-run gate to
  reviewed `mvp:commands` preflight output and JSON metadata.
- Add the same bounded preflight reminder to the `mvp:trial` plan output.
- Update README, OpenSpec specs, and focused tests so the operator workflow
  labels the gate as a local fixture dry run, not proof of a live two-PC
  session.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: Surface the existing evidence fixture readiness
  gate in reviewed preflight and trial planning output.

## Impact

- Affected code: `scripts/mvp-session-commands.mjs`,
  `scripts/mvp-session-commands.test.ts`, `scripts/mvp-trial.mjs`,
  `scripts/mvp-trial.test.ts`, README, and OpenSpec artifacts.
- Touches user-visible MVP workflow text and bounded JSON plan metadata.
- Does not start relay, host, viewer, browser, capture, input, sockets, HTTP
  listeners, services, startup persistence, unattended access, privilege
  elevation, remote log retrieval, log upload, credential access, keylogging,
  AV/EDR evasion, Windows prompt bypass, or hidden sessions.
