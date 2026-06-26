# Change: Viewer ready includes ephemeral browser filter

## Why

The aggregate `mvp:ready` gate validates the explicit ephemeral browser-only
command output, but `mvp:ready -- --role viewer` currently validates only the
default viewer and fixed-port browser blocks. The viewer machine is where the
browser surface runs, so the role-scoped viewer gate should cover the same
ephemeral browser-only output before a live two-PC trial.

## What Changes

- Add `ephemeral-role-filter-browser-command` to the viewer role-scoped ready
  plan.
- Keep relay and host role-scoped plans unchanged.
- Keep the check non-executing and reuse the existing bounded parser.

## Safety Impact

This change only runs the command kit in non-executing text mode and validates
bounded output. It does not start relay, host, viewer, browser, capture, input,
sockets, HTTP listeners, services, startup persistence, unattended access,
privilege elevation, remote discovery, firewall changes, credential access,
keylogging, AV/EDR evasion, Windows prompt bypass, or hidden sessions.

