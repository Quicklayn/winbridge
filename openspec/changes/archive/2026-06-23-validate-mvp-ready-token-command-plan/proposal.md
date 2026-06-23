## Why

The MVP command kit supports a token-protected development relay workflow with
`--token-env`, but the ready helper does not currently validate that
non-executing command-plan path. A regression there could leave the documented
two-PC shared-token workflow broken while the default readiness gate still
passes.

## What Changes

- Add a fixed token-env command-plan validation step to `mvp:ready`.
- Validate that the command kit emits the expected non-executing command names
  and that host/viewer commands reference the fixed relay token environment
  variable.
- Keep ready output bounded and do not print generated commands, token values,
  pairing codes, paths, or child output.
- Do not start relay, host, viewer, browser, capture, input, sockets, services,
  startup persistence, unattended access, privilege elevation, or Windows prompt
  bypass.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: the MVP ready helper validates the non-executing
  shared-token command-plan path.

## Impact

- Affected code: `scripts/mvp-ready.mjs` and focused ready helper tests.
- Affected docs/specs: `openspec/specs/mvp-session-command-kit/spec.md` via this
  change's delta spec, plus README usage text if needed.
- No protocol, relay runtime, auth, installer, service, native Windows API, or
  runtime token handling changes.
