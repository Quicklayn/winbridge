## Why

`npm run mvp:ready -- --include-smoke --json` currently reports only
`smoke=ok`, even though the smoke check now emits bounded subchecks for relay,
frame, surface, signal, input, and audit readiness. The aggregate readiness gate
should expose those bounded subchecks so a developer can see which MVP surface
was verified before a two-PC trial.

## What Changes

- Run the included smoke step in JSON mode from the ready helper.
- Parse only the bounded smoke result fields and attach safe smoke subchecks to
  the aggregate ready result.
- Keep failure diagnostics bounded and avoid raw child stdout/stderr, paths,
  tokens, pairing codes, mutation tokens, signal payloads, audit contents, or
  private reasons.

## Impact

- Affected specs: `mvp-session-command-kit`
- Affected code: `scripts/mvp-ready.mjs`, `scripts/mvp-ready.test.ts`,
  `README.md`
- Safety: read-only aggregate reporting of existing local checks; no new remote
  capability, authorization, capture, input application, browser automation,
  persistence, service installation, privilege elevation, hidden session, or
  unattended behavior.
