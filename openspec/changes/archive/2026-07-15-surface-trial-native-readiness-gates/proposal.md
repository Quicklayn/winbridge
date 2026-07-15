## Why

The non-executing two-PC `mvp:trial` plan currently hides the complete local
smoke and native Windows control readiness gates behind a generated command
plan. An operator can therefore follow the visible trial sections while
missing the explicit checks that prove the local control path is ready.

## What Changes

- Add explicit ordered local all-smoke, native Windows control smoke, and
  evidence-fixture readiness steps to the full trial preflight section.
- Keep native control smoke as a separate manual opt-in because it reads the
  local screen and applies bounded test input.
- Make aggregate readiness validate the exact reviewed trial preflight step
  names and commands so missing, reordered, duplicated, or changed gates fail
  closed.
- Update focused tests and operator documentation for the visible sequence.
- Keep the trial planner non-executing and preserve all current role, consent,
  visibility, revocation, disconnect, token, relay, and audit behavior.
- No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: the full two-PC trial plan explicitly surfaces
  and readiness-validates the complete reviewed local preflight gate sequence.

## Impact

- Affected code: `scripts/mvp-trial.mjs`, `scripts/mvp-ready.mjs`, and focused
  tests.
- Affected docs/specs: README trial/readiness guidance and
  `mvp-session-command-kit`.
- Safety impact: the change references existing capture and input smoke gates
  but does not execute them, change authorization, read tokens, alter relay
  behavior, write audit logs, install software, configure startup or services,
  elevate privileges, or add hidden/unattended behavior. Native control remains
  an explicit visible operator action with existing consent and audit gates.
- Non-goals: no production UI, installer, background service, native adapter
  behavior, screen transport, input semantics, authentication, authorization,
  token handling, or audit persistence changes.
