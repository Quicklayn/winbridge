# Add role-scoped MVP ready

## Why

Two-PC MVP operators often work from separate relay, host, and viewer machines.
The existing `mvp:ready` default intentionally validates the whole command kit,
but there is no bounded way to run only the checks relevant to the current
machine. Operators can run lower-level scripts manually, but that loses the
ready helper's bounded output and role-filter command validation.

## What Changes

- Add `npm run mvp:ready -- --role relay|host|viewer` for explicit role-scoped
  local readiness checks.
- Keep default `mvp:ready` behavior unchanged.
- Reject `--role` combined with `--include-smoke`; smoke remains a full-flow
  explicit local workflow.
- Support `--json` with role mode while preserving bounded diagnostics.

## Safety Impact

Role mode is read-only readiness orchestration. It runs existing read-only
doctor/native checks and existing non-executing command-kit validation. It does
not start relay, host, viewer, browser, capture, input, services, startup
persistence, unattended access, privilege elevation, remote discovery, network
probing, firewall changes, clipboard access, file transfer, diagnostics dumps,
AV/EDR evasion, Windows prompt bypass, hidden sessions, or production
deployment behavior.

## Non-Goals

- Do not weaken the default aggregate readiness checks.
- Do not run smoke from role mode.
- Do not add live connectivity, remote discovery, or automatic process launch.
