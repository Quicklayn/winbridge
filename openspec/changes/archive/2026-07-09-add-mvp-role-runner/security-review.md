# Security Review: add-mvp-role-runner

## Scope

Reviewed changes that add the root `mvp:run` helper, doctor/readiness drift
checks, focused tests, docs, and OpenSpec contracts for foreground relay, host,
and viewer MVP role startup.

## Findings

- Foreground spawn boundary: acceptable for MVP development. The runner starts
  exactly one selected role, uses fixed npm entrypoints plus validated argv
  arrays, inherits terminal stdio, returns the child exit code, and does not
  detach, hide windows, supervise, reconnect, install services, configure
  startup persistence, elevate privileges, or launch browsers.
- Live acknowledgement: acceptable. Live runs require
  `--i-understand-foreground`; `--dry-run` and `--json` remain non-executing
  and do not start child processes.
- Token handling: acceptable for the current reviewed runtime surface. The
  runner rejects raw `--token` input, accepts only `--token-env <NAME>`,
  validates the resolved live env value before spawn, and sanitizes dry-run,
  JSON, usage, and failure output. Relay tokens are passed through child
  environment; host/viewer tokens are resolved from the env name and forwarded
  only to the existing reviewed agent runtime option without shell rendering or
  logging.
- Logs and diagnostics: acceptable. Usage and failure output are bounded and
  do not echo raw relay URLs, token values, token env values, pairing codes,
  generated command strings, child stdout/stderr, local URLs, local paths,
  frame bytes, screen contents, input contents, clipboard contents,
  credentials, diagnostics dumps, or full secrets.
- Capture and input boundaries: acceptable. The runner does not add new
  capture, input, authorization, audit, or relay semantics. Host/viewer argv
  preserves the existing consent prompt, visible session, host controls, audit
  log, finite Windows capture, viewer frame-output, viewer surface, and input
  request markers.
- Readiness and doctor drift checks: acceptable. `mvp:doctor` validates the
  reviewed runner entrypoint, and `mvp:ready` validates sanitized dry-run
  metadata for relay, host, and viewer before live trials.

## Residual Risk

- The live host/viewer agent process receives the resolved relay token as an
  existing runtime argument because the current `dev:agent` entrypoint accepts
  tokens that way. This change does not broaden token collection or logging,
  but a later hardening increment should move agent token intake to
  environment-only input if the runtime supports it.

## Decision

Approved for the development MVP workflow. No hidden sessions, unattended
access, stealth persistence, credential access, keylogging, AV/EDR evasion,
Windows prompt bypass, clipboard/file transfer, diagnostics collection, or
background remote-control behavior was introduced.
