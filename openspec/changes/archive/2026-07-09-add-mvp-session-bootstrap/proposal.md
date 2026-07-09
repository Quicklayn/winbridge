## Why

The two-PC MVP workflow still defaults to `session=demo` and
`pairing=123-456` unless the operator manually coordinates safer shared
metadata. A reviewed bootstrap reference should make real trials start from a
fresh bounded session id and pairing code without weakening the role-filtered
command safety model.

## What Changes

- Add an explicit `--generate-session` option to `mvp:commands` full-plan mode.
- Allow full plans to combine `--generate-session` and `--generate-pairing` so
  operators can print one coordinated bootstrap plan before distributing role
  commands.
- Keep role-filtered and preflight-only command output incompatible with
  generated metadata so each machine must use explicit shared values from the
  one reviewed full plan.
- Add a bounded full-trial bootstrap reference to `mvp:trial` plan output.
- Update README, OpenSpec specs, and focused tests.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: command and trial planning surfaces support a
  reviewed non-executing session bootstrap reference for fresh two-PC trial
  metadata.

## Impact

- Affected code: `scripts/mvp-session-commands.mjs`,
  `scripts/mvp-session-commands.test.ts`, `scripts/mvp-trial.mjs`,
  `scripts/mvp-trial.test.ts`, `scripts/mvp-ready.mjs`,
  `scripts/mvp-ready.test.ts`, README, and OpenSpec artifacts.
- Touches user-visible non-executing workflow text and bounded JSON metadata.
- Does not start relay, host, viewer, browser, capture, input, sockets, HTTP
  listeners, services, startup persistence, unattended access, privilege
  elevation, remote discovery, firewall changes, remote log retrieval, log
  upload, credential access, keylogging, AV/EDR evasion, Windows prompt bypass,
  or hidden sessions.
