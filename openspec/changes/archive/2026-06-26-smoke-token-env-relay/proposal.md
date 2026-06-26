# Change: Add token-env protected MVP smoke relay mode

## Summary
Add an explicit `--token-env` mode to the root MVP smoke check so the local
relay, host, and viewer smoke workflow can exercise the existing shared-token
relay path without printing token values.

## Safety Impact
- Touches relay token configuration and agent token arguments in a development
  smoke workflow.
- Keeps host approval, visible-session indicator checks, host revoke,
  lifecycle denial, audit checks, and viewer disconnect checks unchanged.
- Keeps the smoke workflow local, static-frame only, and bounded.
- Rejects raw token command-line values and references only a bounded
  environment variable name.
- Does not print token values or unsafe input in human or JSON diagnostics.

## Non-Goals
- No production authentication redesign.
- No token generation, storage, persistence, or discovery.
- No Windows capture or OS input changes.
- No browser automation, services, startup persistence, unattended access,
  privilege elevation, credential access, keylogging, AV/EDR evasion, Windows
  prompt bypass, or hidden-session behavior.

