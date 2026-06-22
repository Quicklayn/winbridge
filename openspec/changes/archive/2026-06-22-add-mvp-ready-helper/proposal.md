# Proposal: Add MVP Ready Helper

## Why

Developers currently run several readiness commands manually before a two-PC
MVP trial. A root `mvp:ready` helper should provide one bounded local readiness
gate that aggregates the existing safe checks without exposing raw child output
or starting live remote assistance sessions by default.

## What Changes

- Add `npm run mvp:ready`.
- Run `mvp:doctor` and `mvp:native-preflight` by default.
- Support `--include-smoke` to explicitly add the existing local static smoke
  check.
- Support `--json` for bounded machine-readable aggregate results.
- Add focused tests and README usage.

## Safety Impact

Default mode remains read-only and does not start relay, host, viewer, browser,
capture, input, services, startup persistence, unattended access, privilege
elevation, or Windows prompt bypass. `--include-smoke` may run the existing
bounded local smoke check, which starts local development relay/host/viewer
processes with static frames and cleanup, but still does not use Windows
capture, OS input application, browser automation, services, startup
persistence, privilege elevation, unattended access, or prompt bypass.

The aggregate output must not include raw child stdout/stderr, frame bytes,
surface mutation tokens, raw input commands, relay tokens, pairing codes,
credentials, private reasons, screen contents, clipboard contents,
file-transfer contents, diagnostics dumps, or full secrets.

## Non-Goals

- Do not replace `mvp:commands`.
- Do not launch two-PC relay/host/viewer/browser commands.
- Do not add production UI, installer, service, unattended access, clipboard,
  file transfer, or diagnostics features.
