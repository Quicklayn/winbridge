## Why

WinBridge now has a bounded `mvp:audit-summary` helper, but the reviewed MVP
command plan still stops at runtime/browser steps and leaves the post-run audit
evidence command outside the generated workflow. Adding it to the command kit
reduces operator drift during two-PC trials and makes readiness validation cover
the complete preflight-to-post-run sequence.

## What Changes

- Add a fixed post-run audit summary command to full text and JSON
  `mvp:commands` output.
- Add the same fixed command to preflight-only text and JSON output as a
  post-run reminder, without reading audit files or starting runtimes.
- Update `mvp:ready` command-plan validation to require the fixed
  `preflight.audit-summary` command metadata.
- Document that the generated audit summary command is read-only and must be
  run only after the visible, consented trial has produced local host/viewer
  audit logs.

## Capabilities

### New Capabilities

### Modified Capabilities

- `mvp-session-command-kit`: require command-plan output and readiness parsing
  to include a bounded post-run `mvp:audit-summary` command.

## Impact

- Affected code: `scripts/mvp-session-commands.mjs`,
  `scripts/mvp-session-commands.test.ts`, `scripts/mvp-ready.mjs`,
  `scripts/mvp-ready.test.ts`, README, and OpenSpec artifacts.
- Touches user-visible MVP workflow and log/audit guidance.
- Does not start relay, host, viewer, browser, capture, input, services,
  startup persistence, unattended access, network listeners, privilege
  elevation, remote log retrieval, log upload, hidden sessions, Windows prompt
  bypass, or raw audit inspection.
