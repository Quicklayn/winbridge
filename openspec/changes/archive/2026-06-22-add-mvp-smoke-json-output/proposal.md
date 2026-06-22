# Proposal: Add MVP Smoke JSON Output

## Why

`mvp:doctor` and `mvp:native-preflight` can now emit bounded JSON readiness
metadata, but `mvp:smoke` still emits only text. A machine-readable smoke result
helps local automation and CI gate the static MVP workflow without scraping
human output or exposing raw runtime logs.

## What Changes

- Add `--json` to `npm run mvp:smoke -- [options]`.
- Emit bounded JSON success metadata for relay, frame, surface, input, and
  artifact cleanup state.
- Emit bounded JSON failure metadata with sanitized reason codes only.
- Preserve existing text output and cleanup behavior.

## Safety Impact

This change does not expand remote assistance capabilities. It changes only CLI
formatting around the existing bounded local smoke check. JSON output must not
include child process output, frame bytes, mutation tokens, raw input commands,
pairing codes, relay tokens, credentials, screen contents, clipboard contents,
file-transfer contents, diagnostics dumps, or private reasons.

## Non-Goals

- Do not change smoke process orchestration.
- Do not use Windows capture or host OS input application.
- Do not launch browsers, install services, configure startup persistence,
  elevate privileges, run unattended, evade AV/EDR, or bypass Windows prompts.
