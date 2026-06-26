# Change: Validate token-env role-filter output in default ready

## Why
The aggregate MVP readiness gate validates the full token-env JSON command plan, and role-scoped host/viewer gates validate token-env role-only text output. The default aggregate gate should also validate the token-env host and viewer role-filtered text blocks so the main preflight path catches drift in the operator-facing token-mode commands.

## What Changes
- Add default `mvp:ready` checks for `mvp:commands -- --only host --token-env WINBRIDGE_RELAY_SHARED_TOKEN`.
- Add default `mvp:ready` checks for `mvp:commands -- --only viewer --token-env WINBRIDGE_RELAY_SHARED_TOKEN`.
- Reuse the existing fail-closed parser that requires role-specific output and the bounded environment-variable token reference.

## Safety Impact
This change only adds non-executing command-output validation. It does not start relay, host, viewer, browser, capture, input, sockets, services, startup persistence, unattended access, privilege elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

## Non-Goals
- No raw token support.
- No token generation, storage, or relay authentication changes.
- No production UI, native capture, native input, installer, service, or startup changes.
