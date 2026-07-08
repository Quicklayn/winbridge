## Why

`mvp:evidence-fixture` can dry-run the strict MVP evidence gate, but the
aggregate readiness helper does not yet expose that check as a reviewed
pre-trial option. Adding an explicit readiness include flag makes the operator
workflow easier to verify without changing default read-only readiness.

## What Changes

- Add `--include-evidence-fixture` to `npm run mvp:ready`.
- Keep default readiness unchanged and non-writing.
- When the flag is present, run `mvp:evidence-fixture -- --verify --json` after
  the default readiness checks and validate only bounded fixture JSON metadata.
- Reject the flag in role-scoped readiness mode because role readiness should
  stay local to relay/host/viewer prerequisites.
- Update README, OpenSpec specs, and focused tests.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `mvp-session-command-kit`: Add an explicit evidence-fixture readiness gate to
  the existing MVP readiness helper.

## Impact

- Affected code: `scripts/mvp-ready.mjs`, `scripts/mvp-ready.test.ts`, README,
  and OpenSpec artifacts.
- Touches local logs only through the existing generated fixture helper when
  the new include flag is explicitly supplied.
- Does not change relay runtime, authorization, capture, input, strict evidence
  semantics, installer behavior, startup, services, token handling, privilege
  elevation, browser automation, unattended access, hidden sessions, credential
  access, keylogging, AV/EDR evasion, or Windows prompt bypass.
