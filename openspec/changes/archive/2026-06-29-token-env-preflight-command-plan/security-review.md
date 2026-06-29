# Security Review: Token-env preflight command plan

## Scope

Reviewed changes to:

- `scripts/mvp-session-commands.mjs`
- `scripts/mvp-ready.mjs`
- command-kit and readiness tests
- README command-kit/readiness documentation

## Findings

- Token handling remains name-only. The command kit accepts only validated
  environment variable names through `--token-env` and continues to reject raw
  `--token` values.
- Preflight-only output remains non-executing. The new output only prints
  `mvp:ready`/doctor/native/smoke commands and the all-smoke readiness command;
  it does not start relay, host, viewer, capture, input, browser, installer,
  startup, service, privilege, or persistence behavior.
- The readiness helper validates generated JSON shape and the reviewed
  `$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:<NAME>` reference. It does not read
  token values, probe sockets, or expose child command output.
- No consent, visibility, revocation, authorization, capture, input, relay
  protocol, audit-log persistence, Windows prompt, service, startup, or
  privilege-elevation semantics were weakened.

## Residual Risk

Operators can still choose a poorly managed environment variable name outside
the command kit. The helper mitigates this only by validating the name shape and
never printing the value.
