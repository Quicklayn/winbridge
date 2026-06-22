## Why

The development relay currently binds to `127.0.0.1`. That is safe for local
tests but prevents a real two-Windows-PC MVP trial when the host and viewer run
on separate machines and connect to a relay PC over LAN.

## What Changes

- Add an explicit `WINBRIDGE_RELAY_BIND_HOST` configuration value for the
  development relay.
- Keep the default bind host as `127.0.0.1`.
- Allow `0.0.0.0` only as an explicit opt-in for a visible two-PC development
  trial.
- Update MVP command output so a non-local relay URL prints an explicit relay
  bind host step.

## Safety Impact

This touches relay networking. It does not alter authorization, pairing,
message validation, capture, input, tokens, audit contents, installer,
startup, services, or privilege elevation. LAN exposure remains opt-in and the
existing relay pairing, token support, rate limits, protocol validation, and
host consent requirements remain unchanged.

## Non-Goals

- Opening firewall ports automatically.
- Discovering or printing local IP addresses.
- Enabling Internet-facing deployment guidance.
- Adding unattended access, services, startup persistence, elevation, or
  hidden sessions.
