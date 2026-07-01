## Why

WinBridge's post-run audit summary currently reports evidence coverage, but it
does not provide a fail-closed gate for deciding whether a two-PC MVP trial
actually produced the minimum consent, visibility, frame, input, revocation,
and disconnect evidence. Operators need a bounded command that can be used as
post-run evidence before calling the MVP trial successful.

## What Changes

- Add an explicit `--require-mvp-evidence` option to `npm run mvp:audit-summary`.
- Fail closed when any fixed required MVP evidence flag is missing.
- Keep default summary behavior compatible for troubleshooting partial logs.
- Update the MVP command kit post-run audit command to include the strict gate.
- Keep all output bounded and free of raw audit records, paths, identifiers,
  command strings, frame bytes, input contents, tokens, pairing codes, and
  secrets.

## Capabilities

### Modified Capabilities

- `mvp-audit-summary`: optional strict MVP evidence requirement.
- `mvp-session-command-kit`: post-run audit command rendering and readiness
  validation for the strict audit evidence gate.

## Impact

- Affected code: `scripts/mvp-audit-summary.mjs`,
  `scripts/mvp-audit-summary.test.ts`, `scripts/mvp-session-commands.mjs`,
  `scripts/mvp-session-commands.test.ts`, `scripts/mvp-ready.mjs`,
  `scripts/mvp-ready.test.ts`, README, and OpenSpec specs.
- Touches audit/log handling and user-visible MVP workflow.
- Does not start relay, host, viewer, browser, capture, input, services,
  startup persistence, unattended access, privilege elevation, network
  listeners, remote log retrieval, log upload, credential access, or Windows
  prompt bypass.
