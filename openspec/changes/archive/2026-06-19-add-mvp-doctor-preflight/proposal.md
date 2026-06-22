# Change: Add MVP doctor preflight

## Why

The MVP now has command generation and a local smoke check, but a developer can
still start a two-PC trial on a machine that is missing basic prerequisites or
is not Windows. A bounded doctor command should fail early with safe,
actionable readiness metadata before a relay, host, viewer, capture, or input
process is started.

## What Changes

- Add a root `npm run mvp:doctor` command.
- Check Windows platform, supported Node.js version, required root scripts, and
  required workspace package manifests.
- Print bounded pass/fail readiness lines without secrets or raw environment
  values.

## Safety Impact

The doctor is read-only and local. It does not start relay, host, viewer,
browser, capture, input, sockets, HTTP listeners, services, startup
persistence, unattended access, privilege elevation, clipboard, file transfer,
diagnostics dumps, or Windows prompt bypass.
