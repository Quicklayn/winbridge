# Allow ephemeral viewer surface port

## Why

The local viewer control surface defaults to port `35987`. If that port is
already occupied on the viewer PC, the MVP operator currently has to pick and
validate another fixed port manually. The runtime already resolves the actual
listener address after binding, so an explicit ephemeral port mode can avoid
port collisions while keeping the surface loopback-only and visible.

## What Changes

- Allow viewer CLI `--viewer-control-surface-port 0` when the existing viewer
  frame-output prerequisites are satisfied.
- Keep the local surface bound to `127.0.0.1` and log the resolved URL after
  listen succeeds.
- Allow the MVP command kit to print a viewer command with port `0`; its
  browser step instructs the operator to open the URL printed by the viewer log
  instead of fabricating a fixed URL.
- Keep the default fixed `35987` command kit workflow unchanged.

## Safety Impact

This does not add remote access, LAN binding, hidden sessions, unattended
access, credential access, keylogging, evasion, privilege elevation, services,
startup persistence, or Windows prompt bypass. It only changes local loopback
port selection for an already explicit development viewer surface.

## Non-Goals

- Do not bind the viewer surface to LAN interfaces.
- Do not expose the per-run mutation token in logs or command output.
- Do not change smoke defaults or the default command kit browser command.
