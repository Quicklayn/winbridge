# Change: add-mvp-native-preflight-json-output

## Why

`mvp:native-preflight` is useful before a two-PC MVP trial, but wrappers and CI
cannot consume its status reliably without parsing human-readable text.

## What Changes

Add `npm run mvp:native-preflight -- --json` to emit bounded JSON readiness
metadata for the existing read-only native prerequisite checks.

The existing default text output remains unchanged.

## Safety Impact

The native preflight remains read-only. JSON output MUST NOT start relay, host,
viewer, browser, sockets, HTTP listeners, capture, input, services, startup
persistence, unattended behavior, privilege elevation, clipboard, file transfer,
diagnostics dumps, evasion, prompt bypass, or hidden sessions.

Diagnostics MUST NOT echo raw PowerShell output, paths, tokens, pairing codes,
credentials, screen contents, input contents, keystrokes, private reasons, or
full secrets.

## Non-Goals

- No automatic remediation.
- No execution of capture or input operations.
- No raw PowerShell transcript output.
