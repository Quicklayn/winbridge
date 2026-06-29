# Change: Align MVP ready help with current plan

## Why

`npm run mvp:ready -- --help` still says the default helper runs only the
doctor and native preflight checks, but the reviewed default plan now also
validates non-executing command-plan, LAN, token-env, role-filter, and
ephemeral browser outputs. The stale help text can make an operator
underestimate what the preflight gate covers before a two-PC MVP trial.

## What Changes

- Update the `mvp:ready` usage text to describe the current non-executing
  default validation surface.
- Add tests that keep the help text aligned with the actual default plan.
- Preserve explicit smoke behavior: smoke remains opt-in through the existing
  include flags.

## Safety Impact

This is a documentation/help-text alignment change. It does not start relay,
host, viewer, browser, smoke, capture, or input processes; does not change
consent, authorization, audit, relay, token, installer, startup, service,
privilege, or native Windows API behavior; and does not expose command output,
tokens, pairing codes, paths, frame bytes, input contents, or diagnostics.
