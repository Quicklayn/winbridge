# Design: Token-env protected MVP smoke relay mode

## Approach
The smoke helper will accept `--token-env <NAME>` using the same secret-safe
pattern as the non-executing command kit: the CLI accepts only a bounded
environment-variable name and reads the token value from the process
environment immediately before building the child-process plan.

The relay child receives the token through `WINBRIDGE_RELAY_SHARED_TOKEN`.
The host and viewer children receive the same token through their existing
`--token` CLI option so they connect through the relay's shared-token gate.
The smoke result format remains unchanged and contains only fixed check
metadata, safe reason codes, and optional retained artifact directory metadata.

## Validation
Token-env validation is fail-closed:
- duplicate, missing, malformed, lowercase, or oversized environment-variable
  names are rejected before any child process starts;
- missing, blank, untrimmed, oversized, ASCII-control, or Unicode
  formatting-control token values are rejected before any child process starts;
- raw `--token` remains unsupported by the smoke helper.

## Security Rationale
Passing the resolved token to local child processes is required to exercise the
existing relay shared-token path. The public smoke interface keeps the token out
of command history by accepting an environment-variable name rather than a raw
token argument. The smoke helper must not include child arguments, environment
values, raw relay URLs, or child output in user-facing diagnostics.

## Alternatives
- Keep smoke tokenless: simpler, but it leaves the MVP local smoke path unable
  to verify token-protected relay connections.
- Accept raw `--token`: rejected because it encourages command-history secret
  exposure and conflicts with the existing command-kit token-env pattern.

