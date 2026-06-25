## Why

The MVP smoke workflow already verifies that host and viewer JSONL audit files
exist and contain bounded schema-like records. Before a two-PC trial, the local
smoke and ready gates should also expose a small read-only coverage summary so
developers can see that audit evidence exists for the expected consent,
interaction, and lifecycle paths without inspecting raw logs.

## What Changes

- Extend `mvp:smoke --json` with a bounded audit summary derived from the same
  local smoke audit files after audit readiness passes.
- Surface only fixed safe counts and coverage booleans; never emit audit paths,
  raw records, event ids, authorization ids, actors, targets, details, reasons,
  or action strings from the logs.
- Teach `mvp:ready --include-smoke` to accept and preserve this bounded audit
  summary for default and LAN-style smoke steps.
- Keep human output compact and bounded.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mvp-session-command-kit`: MVP smoke and ready helpers report bounded
  read-only audit coverage metadata.

## Impact

- Affected code: `scripts/mvp-session-smoke.mjs`,
  `scripts/mvp-session-smoke.test.ts`, `scripts/mvp-ready.mjs`,
  `scripts/mvp-ready.test.ts`, README, and OpenSpec documentation.
- Affected systems: same-machine development smoke and ready workflows only.
- Safety impact: read-only audit aggregation. The change does not add native
  capture, OS input, broader log access, auth bypass, relay production
  behavior, installer, startup, service, token exposure, privilege elevation,
  hidden sessions, unattended access, evasion, or Windows prompt bypass
  behavior.
- Non-goals: no audit viewer UI, no raw log export, no production telemetry, no
  clipboard/file transfer/diagnostics, no remote host discovery, and no new
  permission type.
