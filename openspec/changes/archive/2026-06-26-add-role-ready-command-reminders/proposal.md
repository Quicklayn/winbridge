# Change: Add role-scoped ready reminders to filtered MVP commands

## Why

The MVP command kit now supports per-machine command output through
`mvp:commands -- --only <target>` and local readiness through
`mvp:ready -- --role <role>`. Filtered command output still reminds operators to
run only the aggregate `mvp:ready` command on every machine, which is less
precise for a relay, host, or viewer terminal during a two-PC trial.

## What

- Print a role-scoped `mvp:ready -- --role ...` reminder in filtered relay,
  host, viewer, and browser command output.
- Treat the browser target as part of viewer-machine readiness.
- Keep preflight-only output and full command-plan output unchanged.
- Update readiness parsing, tests, and README text so regressions are caught
  without exposing generated command output.

## Safety Impact

This change only alters non-executing command text and bounded validation
markers. It does not start relay, host, viewer, browser, capture, input, HTTP,
or socket processes, does not change authentication or authorization, does not
write audit or frame files, and does not add installer, service, startup,
privilege, token, or log behavior.

## Non-Goals

- No native Windows capture/input changes.
- No relay, signaling, or transport changes.
- No hidden sessions, unattended access, persistence, credential access,
  keylogging, AV/EDR evasion, or Windows prompt bypass.
