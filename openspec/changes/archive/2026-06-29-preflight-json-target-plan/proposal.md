# Proposal

## Why

`mvp:commands -- --preflight-only --json` already prints a bounded
machine-readable preflight command plan, while the operator-oriented
`--only preflight` path is text-only. This makes the preflight role-filter path
less convenient for local automation and readiness drift checks than the
preflight-only mode, even though both represent the same non-executing command
set.

## What

- Allow `npm run mvp:commands -- --only preflight --json` as a strict alias for
  the existing bounded preflight JSON plan.
- Keep JSON rejected for runtime role filters: `relay`, `host`, `viewer`, and
  `browser`.
- Keep `--only preflight` incompatible with session-specific options,
  `--preflight-only`, and `--generate-pairing`.
- Update readiness validation/tests/docs so the preflight JSON target remains
  non-executing, secret-safe, and drift-checked.

## Non-Goals

- No JSON role plans for relay, host, viewer, or browser.
- No process execution, relay startup, host startup, viewer startup, browser
  launch, capture, input, networking, installation, services, startup
  persistence, unattended access, privilege elevation, credential access,
  keylogging, AV/EDR evasion, Windows prompt bypass, hidden sessions, clipboard,
  file transfer, or diagnostics collection.
