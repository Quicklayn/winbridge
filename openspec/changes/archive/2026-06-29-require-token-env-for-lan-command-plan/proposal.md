# Change: Require token env for LAN command plans

## Why

The MVP command kit can currently generate non-loopback two-PC relay commands
without `--token-env`. That makes it too easy to start a LAN-visible
development relay without the existing shared-token guard, even though the
project is still pre-production and production authentication is not complete.

## What Changes

- Reject full-session command plans that use `--relay-host` without
  `--token-env`.
- Reject full-session command plans that use a non-loopback `--relay` URL
  without `--token-env`.
- Keep localhost/loopback command plans and preflight-only output available
  without token-env.
- Update the root MVP readiness helper so its LAN command-plan validation uses
  the reviewed token-env path.

## Safety Impact

This is a fail-closed command generation hardening change. It does not start
processes, open sockets, add persistence, change consent, widen relay access, or
authorize remote actions. Error output remains static usage text and must not
echo relay hosts, token environment values, commands, credentials, or raw input.
