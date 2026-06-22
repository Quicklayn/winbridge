# Proposal: Add MVP Commands JSON Output

## Why

The MVP command kit currently prints a human-readable PowerShell runbook only.
Developers and automation need a bounded machine-readable form of the same
non-executing plan to inspect command steps, preflight-only mode, and safety
notes without parsing free-form text.

## What Changes

- Add `--json` to `npm run mvp:commands`.
- Emit a bounded full-session command plan as JSON.
- Emit a bounded preflight-only command plan as JSON when combined with
  `--preflight-only`.
- Keep malformed JSON/preflight combinations fail-closed with bounded usage
  diagnostics.
- Document the JSON modes in README.

## Safety Impact

This remains command formatting only. The JSON output does not start relay,
host, viewer, browser, capture, input, sockets, services, startup persistence,
privilege elevation, unattended access, or Windows prompt bypass. Raw relay
token values remain rejected; JSON may reference token environment variable
names only when explicitly configured.

## Non-Goals

- Do not execute generated commands.
- Do not add production deployment, auth, native UI, capture, or input behavior.
- Do not print raw tokens, credentials, frame bytes, input payloads, clipboard
  contents, file-transfer contents, diagnostics dumps, or full secrets.
