# Design: Print MVP preflight steps

## Context

`mvp:doctor` checks local readiness and `mvp:smoke` verifies the static local
frame/surface/input path. The command kit is the developer-facing entry point
for a two-PC MVP trial, so it should include those checks in its printed
workflow without executing them.

## Approach

Update `renderMvpSessionCommands()` to print a "0. Preflight" section before
the relay step:

- `npm run mvp:doctor`
- `npm run mvp:smoke`

The text will state that doctor should be run on both Windows machines and
that smoke is a local static preflight. Existing relay/host/viewer/browser
steps remain visible and manually executed.

## Alternatives

- Automatically run doctor or smoke from command generation: rejected because
  the command kit must remain non-executing.
- Keep preflight only in README: less visible at the moment a developer prints
  the runnable workflow.
