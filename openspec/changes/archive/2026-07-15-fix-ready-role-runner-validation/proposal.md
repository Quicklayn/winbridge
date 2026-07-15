## Why

Default `mvp:ready` reaches the role-runner dry-run checks but rejects the npm
command banner before it can accept the reviewed JSON metadata. The banner
contains the fixed readiness session, pairing, and relay arguments, while the
fail-closed parser correctly rejects those values anywhere in child output.

## What Changes

- Invoke readiness-only `mvp:run` checks through npm silent mode so stdout
  contains only the bounded dry-run JSON contract.
- Keep the real root `mvp:run` script in the validation path rather than
  bypassing package-script alignment.
- Require exact ordered role-runner `args` and `env` metadata so appended
  secret-bearing or unreviewed values fail closed.
- Add focused plan and parser tests for silent runner checks, banner drift, and
  extra argument/environment metadata.
- Keep runner roles, runtime behavior, and bounded diagnostics unchanged.
- No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: aggregate readiness validates role-runner dry-run
  JSON without npm command-banner contamination.

## Impact

- Affected code: `scripts/mvp-ready.mjs` and focused tests.
- Affected specs/docs: `mvp-session-command-kit` and README readiness wording
  if needed.
- Safety impact: this change remains non-executing and does not change capture,
  input, authentication, authorization, relay behavior, installer, startup,
  services, token parsing, audit persistence, logs, privilege elevation, or
  host consent and visibility behavior. It does not add hidden sessions,
  unattended access, persistence, credential access, keylogging, AV/EDR
  evasion, Windows prompt bypass, or hidden capture/input.
