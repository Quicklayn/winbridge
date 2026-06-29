# Change: Validate token-env relay role filter

## Why

`mvp:ready` already validates token-env host and viewer role-filter command
output, but the relay-only token-env role-filter path is weaker: a developer
can ask for `mvp:commands -- --only relay --token-env ...` without the ready
gate separately checking that the filtered relay output preserves bounded
token-env guidance. This leaves a small operator-readiness gap for two-PC MVP
trials.

## What Changes

- Add a bounded token-env note to filtered relay/host/viewer/browser command
  output when `--token-env <NAME>` is provided.
- Add default and relay-role `mvp:ready` validation for
  `mvp:commands -- --only relay --token-env WINBRIDGE_RELAY_SHARED_TOKEN`.
- Keep token values out of output and keep localhost/default relay commands
  tokenless unless `--token-env` is explicitly supplied.

## Safety Impact

This is non-executing command-generation/readiness hardening. It does not start
relay, host, viewer, browser, smoke, capture, or input processes; does not
change consent, authorization, audit, relay transport, installer, startup,
service, privilege, or native Windows API behavior; and must not expose token
values, pairing codes, command output, child output, paths, frame bytes, input
contents, credentials, or diagnostics.
