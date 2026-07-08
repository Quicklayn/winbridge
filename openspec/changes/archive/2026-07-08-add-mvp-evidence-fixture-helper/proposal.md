## Why

The project has a strict post-run MVP evidence gate, but developers currently
need hand-written audit logs or a full two-PC run to verify that the gate and
operator instructions are wired correctly. A safe local fixture helper gives a
repeatable dry-run path for the evidence workflow without starting remote
assistance runtime processes.

## What Changes

- Add a root `npm run mvp:evidence-fixture` helper that writes bounded,
  schema-like host and viewer audit JSONL fixtures to explicit local paths.
- Make the helper optionally run the existing strict
  `mvp:audit-summary -- --require-mvp-evidence` logic against those generated
  files.
- Keep the helper local-only and non-runtime: no relay, host, viewer, browser,
  capture, input, sockets, services, startup persistence, privilege elevation,
  unattended access, remote log retrieval, or log upload.
- Add doctor/ready documentation and tests where needed so operators can use
  the fixture as a pre-trial evidence-gate dry run.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-audit-summary`: Add a local safe fixture helper for proving the strict
  MVP audit evidence gate without a live remote-assistance session.

## Impact

- Affected code: new `scripts/mvp-evidence-fixture.mjs`, tests, root
  `package.json` script wiring, `mvp:doctor` script/entrypoint alignment,
  README, and OpenSpec artifacts.
- Touches local logs only by writing explicit operator-supplied or default
  development fixture paths.
- Does not change relay runtime admission, authorization, capture, input,
  audit-summary evidence semantics, installer behavior, startup, services,
  token handling, privilege elevation, browser automation, unattended access,
  hidden sessions, credential access, keylogging, clipboard access, AV/EDR
  evasion, or Windows prompt bypass.
