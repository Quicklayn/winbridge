# Design: Add MVP Commands Preflight-Only Output

## Overview

`scripts/mvp-session-commands.mjs` already validates all configurable command
values before formatting the complete MVP command sequence. The new mode is a
standalone flag that bypasses option-value parsing and renders a smaller static
preflight checklist.

## CLI Behavior

- `--preflight-only` is accepted only as the sole argument.
- `--help` remains accepted only as the sole argument.
- Combining `--preflight-only` with other options fails closed through the
  existing bounded usage output.

## Rendering

The preflight-only renderer prints:

- root title for WinBridge MVP preflight commands;
- doctor and native preflight commands for each Windows machine;
- smoke check command for one local development machine;
- bounded visible-session and consent safety notes;
- non-execution statement.

It must not print relay address guidance, relay commands, host commands, viewer
commands, browser launch commands, token references, capture options, input
application options, or Start-Process commands.

## Security Rationale

Flag-only parsing keeps the mode simple and avoids accidentally mixing
preflight output with runnable session output. The rendered output is
static and side-effect-free, preserving the command kit's existing
development-only safety posture.

## Alternatives

- Reuse the full command output and ask users to ignore later sections. Rejected
  because it leaves runnable relay/host/viewer/browser commands in readiness
  output.
- Add multiple filtered output modes. Rejected for MVP because a single
  preflight-only mode covers the immediate readiness workflow.
