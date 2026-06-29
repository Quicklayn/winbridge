# Change: Validate token-env browser role filter

## Why

`mvp:commands -- --only browser --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
prints bounded token-mode guidance for the browser-only operator step, but
`mvp:ready` currently validates only the token-env relay, host, and viewer
role-filter outputs. The viewer workflow therefore has a small readiness gap:
browser-only token guidance can drift without the aggregate or viewer-scoped
ready gate noticing.

## What Changes

- Add default `mvp:ready` validation for browser role-filter output rendered
  with `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`.
- Add viewer-scoped `mvp:ready -- --role viewer` validation for the same
  browser-only token-env output.
- Require browser-only markers plus bounded token-mode guidance, while
  rejecting host, viewer, relay, raw-token, and cross-target command drift.

## Safety Impact

This is non-executing command-plan/readiness validation. It does not start a
browser, relay, host, viewer, smoke helper, capture, input, sockets, services,
startup persistence, privilege elevation, or native Windows APIs. It does not
change consent, authorization, audit, relay transport, installer, startup,
service, privilege, or Windows security prompt behavior. It must not expose raw
token values, token environment values, pairing codes, relay URLs, local URLs,
paths, command output, child output, frame bytes, input contents, credentials,
or diagnostics.

## Non-Goals

- Do not change the browser command itself.
- Do not add browser launching to readiness checks.
- Do not change host/viewer authorization, capture, input, or audit behavior.
