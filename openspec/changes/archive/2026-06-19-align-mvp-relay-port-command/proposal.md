## Why

`mvp:commands` lets the developer pass a custom relay URL, but the printed relay
terminal command currently starts the relay with its default port unless the
user separately sets `WINBRIDGE_RELAY_PORT`. For a two-PC MVP trial with a
non-default relay URL port, host and viewer would connect to one port while the
relay listens on another.

## What Changes

- Print an explicit `WINBRIDGE_RELAY_PORT` assignment in the relay terminal step
  whenever the validated relay URL port differs from the development default.
- Keep default `ws://localhost:8787/` output unchanged.
- Preserve existing token-env and LAN bind-host behavior.

## Safety Impact

This is generated command text only. It does not start relay, host, viewer,
browser, capture, input, sockets, services, startup persistence, elevation, or
unattended access. It does not change authorization, pairing, token validation,
or relay behavior.

## Non-Goals

- Auto-selecting ports.
- Opening firewall ports.
- Starting or supervising any process.
