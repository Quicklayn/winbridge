# Change: Include LAN host and viewer filters in role ready

## Why

Two-PC MVP operators often run role-scoped readiness on separate host and
viewer machines. The aggregate ready gate validates a representative LAN JSON
command plan, and relay role readiness validates the LAN relay-only block. Host
and viewer role readiness still validate only localhost-shaped filtered agent
blocks, so they do not catch drift in the LAN-shaped host and viewer operator
commands.

## What Changes

- Add host role-scoped readiness validation for
  `mvp:commands -- --only host --relay-host 192.168.1.10`.
- Add viewer role-scoped readiness validation for
  `mvp:commands -- --only viewer --relay-host 192.168.1.10`.
- Validate internally that each selected block remains target-only and includes
  the representative LAN relay URL shape.
- Keep relay role readiness, browser readiness, and default aggregate behavior
  unchanged.

## Safety Impact

This change only validates printed command text. It does not start relay,
host, viewer, browser, capture, input, sockets, HTTP listeners, services,
startup persistence, unattended access, privilege elevation, LAN discovery,
firewall changes, AV/EDR evasion, Windows prompt bypass, or hidden-session
behavior.

## Non-Goals

- Do not add `mvp:ready` user-provided relay URL options.
- Do not probe LAN interfaces or test remote connectivity.
- Do not echo generated command strings, relay URLs, paths, pairing codes,
  token references, stdout, stderr, or child output in readiness output.
