## Why

`npm run mvp:ready` is the main preflight gate before a two-PC MVP trial, but it does not currently verify that the command plan generator itself can render a safe session plan. A broken `mvp:commands` helper can leave the project appearing ready while the actual user-facing startup instructions are unusable.

## What Changes

- Add a default `mvp:ready` command-plan readiness check after doctor and native preflight.
- The check runs the existing non-executing MVP command kit in bounded JSON mode and reports only fixed status metadata.
- `--include-smoke` continues to run smoke only after all default readiness checks pass.
- Keep output bounded and prevent child stdout/stderr, paths, tokens, pairing codes, raw commands, frame bytes, input contents, or other secrets from leaking through ready output.
- Safety impact: this is a local readiness check only. It must not start relay, host, viewer, browser, capture, input, services, startup persistence, unattended access, privilege elevation, or Windows prompt bypass.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: the MVP ready helper now validates the command-plan generator as part of default readiness.

## Impact

- `scripts/mvp-ready.mjs`
- `scripts/mvp-ready.test.ts`
- `README.md`
- `openspec/specs/mvp-session-command-kit/spec.md` after archive
