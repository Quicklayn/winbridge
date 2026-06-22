# Change: add-mvp-doctor-json-output

## Why

Two-PC MVP readiness checks are currently human-readable only. A developer or
CI wrapper cannot reliably consume `mvp:doctor` output without parsing text.

## What Changes

Add `npm run mvp:doctor -- --json` to emit bounded JSON readiness metadata:

- `ok`
- optional bounded `reason`
- `checks` with check names, `ok`, and optional bounded `reason`

The existing default text output remains unchanged.

## Safety Impact

The doctor remains read-only. JSON output MUST NOT start relay, host, viewer,
browser, sockets, HTTP listeners, capture, input, native adapters, services,
startup persistence, unattended behavior, privilege elevation, clipboard, file
transfer, diagnostics dumps, evasion, prompt bypass, or hidden sessions.

Diagnostics MUST NOT echo raw paths, tokens, pairing codes, credentials, screen
contents, input contents, keystrokes, private reasons, or full secrets.

## Non-Goals

- No automatic remediation.
- No arbitrary file path output.
- No execution of checked scripts.
