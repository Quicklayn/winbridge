# Design: Token-env preflight command plan

## Overview

The command kit already has a single renderer for the all-smoke preflight
command. Full-session token-env mode uses it to print:

`$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:<NAME>; npm run mvp:ready -- --include-all-smoke`

The change extends only the argument parser paths for preflight selectors so
they can carry the validated `tokenEnv` value into the existing renderer.

## Parser Behavior

`--preflight-only` and `--only preflight` will accept only the existing
`--token-env <NAME>` option after fixed flags. Any other option remains a usage
error. `--generate-pairing`, duplicate selectors, raw `--token`, malformed
environment variable names, relay/session/display/capture options, and mixed
preflight selectors remain rejected before rendering.

## Readiness Validation

The default `mvp:ready` plan will add a non-executing check:

`mvp:commands -- --only preflight --json --token-env WINBRIDGE_RELAY_SHARED_TOKEN`

The preflight JSON parser will optionally require the reviewed token-env
all-smoke assignment on `preflight.ready-all-smoke`. The parser still requires
the exact preflight command set, `ok: true`, `mode: "preflight"`, and
`nonExecuting: true`.

## Security Rationale

The implementation uses the existing environment-name validator and rejects raw
token values through the existing option parser. The generated output references
an environment variable by name and never includes the secret value. The helper
remains non-executing and does not create network connections or start local
runtime processes.
