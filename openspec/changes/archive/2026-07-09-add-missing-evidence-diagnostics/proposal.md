## Why

After a two-PC MVP trial, a strict evidence failure currently reports only
`missing-required-evidence`. That is safe, but too coarse for operators to
quickly decide whether the missing proof is host approval, visible
authorization, frame output, input, revocation, or disconnect evidence.

## What Changes

- Add bounded missing-evidence diagnostics to strict MVP audit evidence
  failures.
- Surface only fixed role/flag identifiers such as
  `host.authorizationActive` or `viewer.inputSent`.
- Keep text and JSON failure output secret-safe and free of raw audit paths,
  records, identifiers, screen contents, input contents, command strings, and
  child output.
- Surface the same bounded diagnostics through `mvp:trial -- --evidence` when
  the delegated strict audit gate fails.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-audit-summary`: strict evidence failure diagnostics include bounded
  missing role/flag metadata for the audit summary and trial evidence helpers.

## Impact

- Affected code: `scripts/mvp-audit-summary.mjs`,
  `scripts/mvp-audit-summary.test.ts`, `scripts/mvp-trial.mjs`,
  `scripts/mvp-trial.test.ts`, README, and OpenSpec artifacts.
- Touches local audit-log failure diagnostics only.
- Does not start relay, host, viewer, browser, capture, input, sockets, HTTP
  listeners, services, startup persistence, unattended access, privilege
  elevation, remote log retrieval, log upload, credential access, keylogging,
  AV/EDR evasion, Windows prompt bypass, or hidden sessions.
