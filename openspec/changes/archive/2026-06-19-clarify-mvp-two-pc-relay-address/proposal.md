## Why

The MVP command kit defaults to `ws://localhost:8787/`, which is useful for
local development but easy to misuse during a two-Windows-PC trial. On separate
machines, `localhost` points to each individual PC, not the relay PC, so the
host and viewer can fail to connect even when the product path is otherwise
ready.

## What Changes

- Add bounded guidance to `mvp:commands` explaining that `localhost` is only
  for a same-machine trial.
- Tell users to pass `--relay ws://<relay-pc-lan-ip>:8787` or a DNS name for a
  two-PC trial.
- Keep the command kit non-executing and secret-safe.

## Safety Impact

This is documentation in generated command output only. It does not change
authorization, relay behavior, capture, input, tokens, logs, installer,
startup, services, or privilege elevation. The guidance helps users keep the
manual visible-session workflow explicit instead of troubleshooting hidden or
ambiguous connectivity failures.

## Non-Goals

- Auto-detecting LAN IP addresses.
- Starting relay, host, viewer, browser, capture, or input.
- Configuring firewalls, services, startup persistence, elevation, or
  unattended access.
