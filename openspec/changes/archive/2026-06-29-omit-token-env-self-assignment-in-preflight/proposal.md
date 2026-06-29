# Change: Omit token-env self-assignment in preflight

## Why

The command kit currently renders token-env all-smoke preflight commands as an
environment assignment from the selected token variable into
`WINBRIDGE_RELAY_SHARED_TOKEN`. That is useful when the selected variable is a
different bounded name, but it becomes confusing when the selected variable is
already `WINBRIDGE_RELAY_SHARED_TOKEN`:

`$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:WINBRIDGE_RELAY_SHARED_TOKEN; ...`

This is secret-safe, but it adds unnecessary shell noise to the reviewed MVP
operator workflow.

## What Changes

- Render token-env all-smoke preflight commands without self-assignment when
  the selected token env is already `WINBRIDGE_RELAY_SHARED_TOKEN`.
- Preserve assignment behavior when the selected token env uses any other
  bounded environment variable name.
- Update ready validation and tests to accept both reviewed safe forms while
  still failing closed on missing, malformed, or raw token output.

## Safety Impact

This is a non-executing command-generation/readiness cleanup. It does not start
relay, host, viewer, browser, smoke, capture, input, sockets, services,
startup persistence, privilege elevation, or native Windows APIs. It must not
print token values, token environment values, credentials, pairing codes, local
paths, command output, child output, frame bytes, input contents, or
diagnostics. It does not change consent, authorization, audit, relay transport,
installer, startup, service, privilege, or Windows security prompt behavior.

## Non-Goals

- Do not change relay runtime token handling.
- Do not change host or viewer token argument behavior.
- Do not remove all-smoke readiness from generated preflight plans.
- Do not add raw token support.
