## Context

`mvp:ready -- --include-all-smoke` now provides the fullest local smoke gate,
but `mvp:commands` still prints only `npm run mvp:smoke` in its preflight
section and JSON command plan. The root readiness helper validates the command
plan by fixed command names, so command-plan validation must be updated in the
same change.

## Goals / Non-Goals

**Goals:**

- Print the all-smoke readiness gate in human full-session and preflight-only
  command-kit output.
- Include the all-smoke gate in JSON command-plan output.
- Keep token handling environment-reference-only and secret-safe.
- Update `mvp:ready` command-plan validation to require the all-smoke preflight
  command entry.

**Non-Goals:**

- No new remote assistance capability.
- No command execution from the command kit.
- No relay, host, viewer, browser, capture, input, installer, service,
  startup, privilege, unattended, clipboard, file-transfer, diagnostics,
  evasion, prompt-bypass, or hidden-session behavior changes.

## Decisions

- Use a fixed command-plan entry name `preflight.ready-all-smoke`.
  - Rationale: it matches the existing fixed preflight command list while
    making the new gate machine-verifiable.
- In human token-env command plans, print an environment-reference assignment
  from the operator's chosen token env to `WINBRIDGE_RELAY_SHARED_TOKEN`.
  - Rationale: `--include-all-smoke` uses the fixed smoke token environment
    name, while command kit already supports custom token env names for runtime
    commands.
  - Alternative considered: print only a prose reminder. That is less useful
    for copy/paste preflight while still not exposing token values.
- Keep the command kit non-executing.
  - Rationale: all safety-sensitive behavior remains inside explicit operator
    commands and existing readiness/smoke gates.

## Risks / Trade-offs

- Longer printed preflight section -> keep the added text focused and bounded.
- Token-env confusion with custom env names -> print only environment variable
  references, never token values.
- Ready validation drift -> add focused tests for JSON command-plan validation
  and command rendering.
