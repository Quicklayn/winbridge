# Change: Validate token-env preflight role filter

## Why

`mvp:ready` validates normal preflight role-filter text output and token-env
preflight JSON output, but it does not separately validate the text output for
`mvp:commands -- --only preflight --token-env WINBRIDGE_RELAY_SHARED_TOKEN`.
That leaves a small operator-readiness gap: token-mode guidance for preflight
text can drift while the default readiness gate still passes.

## What Changes

- Add default `mvp:ready` validation for preflight role-filter text output
  rendered with `--token-env WINBRIDGE_RELAY_SHARED_TOKEN`.
- Require preflight-only role-filter markers plus bounded token-mode guidance.
- Reject output that omits token guidance, uses the wrong token env, includes
  raw token literals, or mixes preflight output with relay, host, viewer,
  browser, capture, or input command blocks.

## Safety Impact

This is non-executing command/readiness validation. It does not start relay,
host, viewer, browser, smoke, capture, input, sockets, services, startup
persistence, privilege elevation, or native Windows APIs. It does not change
consent, authorization, audit, relay transport, installer, startup, service,
privilege, or Windows security prompt behavior. It must not expose raw token
values, token environment values, pairing codes, relay URLs, local URLs, paths,
command output, child output, frame bytes, input contents, credentials, or
diagnostics.

## Non-Goals

- Do not change preflight command execution semantics.
- Do not add smoke, relay, host, viewer, browser, capture, or input execution.
- Do not change role-scoped relay/host/viewer readiness plans.
