# Design

## Ready Plan

Add a `token-role-filter-browser-command` step to the default aggregate ready
plan and to viewer-scoped readiness. The step runs the existing non-executing
command kit:

`mvp:commands -- --only browser --token-env WINBRIDGE_RELAY_SHARED_TOKEN`

The step should run near the existing viewer/browser role-filter checks so the
readiness result remains easy to scan.

## Parser

Add a browser-specific token-env role-filter parser. It should compose the
existing browser role-filter marker validation with checks that:

- `$env:WINBRIDGE_RELAY_SHARED_TOKEN` appears in bounded token-mode guidance;
- raw token literals or `--token` command arguments do not appear;
- host, viewer, relay, preflight, or live agent command blocks remain absent.

The browser command itself remains unchanged because browser startup does not
consume the relay token directly. The token guidance is still useful in the
viewer workflow because it keeps all role-filter outputs aligned around the
same relay-token setup.

## Non-Goals

- No runtime browser launch.
- No changes to local viewer control surface binding, mutation tokens, capture,
  input, authorization, audit persistence, native Windows wrappers, installer,
  startup, or services.
