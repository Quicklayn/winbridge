# Change: Print MVP preflight steps

## Why

The command kit now coexists with `mvp:doctor` and `mvp:smoke`, but its printed
two-PC workflow still starts at the relay terminal. Developers should see the
readiness and local smoke preflight steps in the generated sequence before
starting a visible remote assistance session.

## What Changes

- Add a preflight section to `npm run mvp:commands` output.
- Print `npm run mvp:doctor` for each Windows machine.
- Print `npm run mvp:smoke` as a local preflight before the two-PC trial.
- Keep the command kit strictly non-executing.

## Safety Impact

The command kit still only prints text. It does not start relay, host, viewer,
browser, capture, input, sockets, HTTP listeners, services, startup
persistence, unattended access, privilege elevation, or Windows prompt bypass.
