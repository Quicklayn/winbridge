## Context

`mvp:ready` supports independent smoke opt-ins for default/LAN smoke,
token-protected smoke, and LAN-style token-protected smoke. Those switches are
useful for targeted diagnostics, but the full pre-trial local coverage requires
remembering all three flags.

## Goals / Non-Goals

**Goals:**

- Add a single explicit readiness flag that runs all existing local smoke
  variants after the default non-smoke readiness checks.
- Keep individual smoke flags available for targeted diagnostics.
- Keep output bounded and secret-safe by reusing the existing smoke JSON parser
  and formatter.
- Reject ambiguous flag combinations before any checks run.

**Non-Goals:**

- No new smoke workflow or relay mode.
- No production authentication, relay authorization, capture, input, installer,
  service, startup, unattended access, or privilege behavior changes.
- No public relay bind, LAN discovery, firewall automation, browser automation,
  hidden sessions, Windows prompt bypass, AV/EDR evasion, credential access, or
  keylogging.

## Decisions

- Add `--include-all-smoke` as an explicit default-mode-only flag.
  - Rationale: full smoke coverage can take longer and requires a valid
    `WINBRIDGE_RELAY_SHARED_TOKEN`, so it must remain opt-in.
  - Alternative considered: make `--include-smoke` imply every smoke variant.
    That would change existing command behavior and unexpectedly require token
    setup.
- Make `--include-all-smoke` mutually exclusive with individual smoke flags.
  - Rationale: this keeps command intent clear and prevents duplicate smoke
    steps.
  - Alternative considered: allow combinations and dedupe internally. That
    makes invalid operator input look successful and hides mistakes.
- Implement all-smoke by expanding the existing readiness plan options instead
  of adding a separate parser path.
  - Rationale: smoke step ordering, parsing, skipped metadata, and formatting
    stay centralized.
- Strip ambient `WINBRIDGE_RELAY_SHARED_TOKEN` from smoke child environments
  unless the plan explicitly sets it.
  - Rationale: default and LAN smoke variants must stay tokenless even when the
    parent readiness shell has a token configured for later tokenized smoke
    steps.
  - Alternative considered: run tokenized smoke first. That would not fix
    individual default smoke invocations from token-configured shells.

## Risks / Trade-offs

- Longer runtime when all-smoke is enabled -> keep default behavior unchanged
  and require an explicit flag.
- Missing token environment value can fail the full smoke run -> document that
  `WINBRIDGE_RELAY_SHARED_TOKEN` must be set before using the all-smoke flag.
- Ambient token inheritance can accidentally protect a tokenless smoke relay ->
  build child envs with the ambient relay token removed unless explicitly set
  by the smoke plan.
- Ambiguous CLI combinations could surprise users -> fail closed before running
  checks when `--include-all-smoke` is combined with individual smoke flags or
  role-scoped readiness.
