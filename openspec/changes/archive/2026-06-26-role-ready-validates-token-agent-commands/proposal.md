# Change: Validate token-env host/viewer role ready commands

## Summary
Add role-scoped MVP readiness checks for host and viewer token-env command output.

## Motivation
The aggregate `mvp:ready` gate already validates that the full command plan can reference a bounded relay shared-token environment variable without printing raw token values. Operators running only the local host or viewer readiness gate before a two-PC trial should get the same drift protection for their role-specific command block.

## Safety Impact
This change only adds non-executing readiness validation for command text. It does not start relay, host, viewer, browser, capture, input, services, startup persistence, unattended access, privilege elevation, remote discovery, firewall changes, AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

## Non-Goals
- No raw token value support.
- No token generation, storage, or relay authentication behavior changes.
- No changes to native capture, OS input, installer, startup, or services.
