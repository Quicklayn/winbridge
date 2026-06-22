# Change: harden-mvp-doctor-script-entrypoints

## Why

`mvp:doctor` verifies required root npm script names, but a stale or incomplete
checkout can still pass when those scripts point at missing root helper files.
Before a two-PC MVP trial, the doctor should fail earlier if the command kit,
smoke check, or native preflight entrypoint file is missing.

## What Changes

Extend the doctor static entrypoint check to include required root MVP helper
scripts:

- `scripts/mvp-doctor.mjs`
- `scripts/mvp-native-preflight.mjs`
- `scripts/mvp-session-commands.mjs`
- `scripts/mvp-session-smoke.mjs`

The existing bounded `missing-entrypoint` failure reason remains unchanged.

## Safety Impact

This remains a read-only local prerequisite check. It MUST NOT start relay,
host, viewer, browser, sockets, HTTP listeners, capture, input, native adapters,
services, startup persistence, unattended behavior, privilege elevation,
clipboard, file transfer, diagnostics dumps, AV/EDR evasion, Windows prompt
bypass, or hidden session behavior.

Diagnostics remain bounded reason codes and MUST NOT echo raw paths, tokens,
pairing codes, credentials, screen contents, input contents, keystrokes, private
reasons, or full secrets.

## Non-Goals

- No execution of the helper scripts.
- No validation of arbitrary npm script command syntax.
- No Windows native prerequisite checks beyond invoking the already separate
  `mvp:native-preflight` command manually.
