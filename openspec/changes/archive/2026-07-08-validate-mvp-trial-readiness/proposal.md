## Why

`mvp:trial` is now the shortest operator entrypoint for the two-PC MVP path,
but the aggregate readiness gate does not yet validate that helper's JSON shape
or role filters. If the trial workflow drifts, operators could miss it until a
manual two-PC run.

## What Changes

- Add non-executing `mvp:trial -- --json` validation to default `mvp:ready`.
- Add role-scoped `mvp:trial -- --role <role> --json` validation to relay,
  host, and viewer readiness.
- Add `mvp:trial` root script alignment to `mvp:doctor`.
- Keep evidence mode out of readiness because it requires explicit post-run
  audit files.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: readiness and doctor gates validate the reviewed
  two-PC trial helper plan output and root script alignment.

## Impact

- Affected code: `scripts/mvp-ready.mjs`, `scripts/mvp-ready.test.ts`,
  `scripts/mvp-doctor.mjs`, `scripts/mvp-doctor.test.ts`, README, and
  OpenSpec artifacts.
- Touches relay/auth/logs only as non-executing command references in bounded
  readiness parsing.
- Does not add or change capture, input, relay runtime, authorization, audit
  records, installer behavior, startup, services, tokens, privilege elevation,
  browser automation, unattended access, hidden sessions, credential access,
  keylogging, clipboard access, AV/EDR evasion, or Windows prompt bypass.
- Safety impact: strengthens fail-closed readiness for the operator workflow
  while preserving consent, visibility, revocation, and audit requirements.
