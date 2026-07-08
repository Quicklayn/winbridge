## Security Review

Change: `validate-mvp-trial-readiness`

Reviewed paths:

- `scripts/mvp-ready.mjs`
- `scripts/mvp-ready.test.ts`
- `scripts/mvp-doctor.mjs`
- `scripts/mvp-doctor.test.ts`
- `README.md`
- `openspec/changes/validate-mvp-trial-readiness/specs/mvp-session-command-kit/spec.md`

## Findings

No safety blocker found.

The readiness changes add only local child-process invocations of the existing
non-executing `mvp:trial` plan helper. The new parser accepts only exact
bounded JSON metadata with `ok=true`, `mode=plan`, `nonExecuting=true`,
reviewed relay/host/viewer/evidence role records, and reviewed safety markers.
It rejects evidence mode, duplicate roles, cross-role metadata, malformed
sections, extra top-level fields, changed step names, changed command
references, and oversized output.

Role-scoped readiness validates only the matching `relay`, `host`, or `viewer`
trial role plan. Evidence mode remains outside readiness because it requires
explicit post-run audit files.

Doctor alignment now checks that the root `mvp:trial` script still maps to
`node scripts/mvp-trial.mjs`. The doctor check is read-only and does not import
or execute the trial helper.

## Safety Invariants

- Host consent remains required before any live assistance session.
- Host-visible active-session indicators are unchanged.
- Host pause, revoke, terminate, and disconnect controls are unchanged.
- Audit evidence requirements are unchanged and still verified only through
  explicit post-run evidence mode.
- No relay, host, viewer, browser, capture, input, socket, HTTP listener,
  service, startup persistence, unattended access, privilege elevation, LAN
  discovery, firewall change, AV/EDR evasion, Windows prompt bypass, or hidden
  session behavior is added.
- Failure output remains bounded check metadata and does not echo generated
  commands, relay URLs, local URLs, token values, token environment values,
  pairing codes, local paths, audit records, frame bytes, screen contents,
  input contents, stdout, stderr, child output, credentials, diagnostics dumps,
  or full secrets.

## Verification

Focused verification was run with:

```powershell
npx vitest run scripts/mvp-ready.test.ts scripts/mvp-doctor.test.ts scripts/mvp-trial.test.ts
```

Result: passed, 88 tests.
