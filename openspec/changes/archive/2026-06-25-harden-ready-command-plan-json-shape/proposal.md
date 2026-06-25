## Why

`mvp:ready` validates the non-executing `mvp:commands --json` output before a
two-PC trial. It already verifies fixed command names and selected command
contents internally without surfacing raw command strings, but the top-level
command-plan JSON shape should also fail closed when unexpected fields are
present.

## What Changes

- Reject top-level command-plan JSON fields outside the ready-consumed bounded
  shape.
- Keep accepting the current safe `safety` metadata array emitted by
  `mvp:commands --json`.
- Add focused parser tests for unexpected top-level command-plan fields.

## Capabilities

### Modified Capabilities

- `mvp-session-command-kit`: ready helper command-plan parsing is stricter
  about the top-level bounded JSON shape.

## Impact

- Affected code: `scripts/mvp-ready.mjs`, `scripts/mvp-ready.test.ts`.
- Affected workflow: `npm run mvp:ready`.
- Security impact: parser/output hardening only. No runtime command execution,
  capture, OS input application, browser automation, networking, authorization,
  token handling, audit persistence, service/startup behavior, privilege
  elevation, or Windows prompt changes.
