# Change: Include LAN bind relay filter in relay ready

## Why

Relay operators in a two-PC MVP trial must run the relay with the reviewed LAN
bind setting when the generated plan targets a LAN relay URL. The aggregate
`mvp:ready` gate already validates the LAN command plan, but
`mvp:ready -- --role relay` currently validates only the default localhost
relay block. This leaves the per-machine relay gate less representative of the
actual two-PC command shape.

## What Changes

- Add a relay role-scoped readiness step that runs the non-executing command
  kit as `mvp:commands -- --only relay --relay-host 192.168.1.10`.
- Validate internally that the relay-only output contains the reviewed
  `WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'` marker and remains relay-only.
- Keep host and viewer role-scoped ready plans unchanged.
- Keep all readiness output bounded to fixed check names and safe reason
  metadata.

## Safety Impact

This change only validates printed command text. It does not start relay,
host, viewer, browser, capture, input, sockets, HTTP listeners, services,
startup persistence, unattended access, privilege elevation, firewall changes,
AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

## Non-Goals

- Do not add network probing, LAN discovery, firewall changes, or relay startup.
- Do not echo generated command strings, relay URLs, paths, pairing codes,
  tokens, stdout, stderr, or child output in readiness output.
- Do not change production relay authentication or deployment.
