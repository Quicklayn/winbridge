## Context

`mvp:smoke` already supports a local LAN-style relay URL shape through
`--lan-relay` and token-protected relay connections through
`--token-env WINBRIDGE_RELAY_SHARED_TOKEN`. `mvp:ready` can aggregate default,
LAN-style, and token smoke checks, but it does not expose one explicit readiness
step for the combined LAN-style token-protected path.

## Goals / Non-Goals

**Goals:**

- Add an explicit default-mode readiness flag for the combined
  LAN-style/token-protected smoke path.
- Keep the step opt-in, bounded, and secret-safe.
- Reuse the existing smoke JSON parser and fixed readiness formatting.
- Document the operator workflow in README.

**Non-Goals:**

- No production authentication changes.
- No public relay bind, LAN discovery, firewall automation, services, startup
  persistence, unattended access, or installer behavior.
- No native Windows capture or OS input behavior changes.
- No browser automation or hidden session behavior.

## Decisions

- Add a separate `--include-lan-token-smoke` flag instead of overloading
  `--include-smoke` or `--include-token-smoke`.
  - Rationale: the combined path requires a configured token environment value
    and should remain an explicit, operator-visible choice.
  - Alternative considered: always run LAN-token smoke when both existing flags
    are present. That is less clear and can surprise callers that expect exactly
    three smoke steps.
- Represent the result as a fixed `lan-token-smoke` check name.
  - Rationale: readiness output stays bounded and does not need command strings,
    relay URLs, token references, stdout, or stderr.
- Reject the flag in role-scoped readiness.
  - Rationale: role mode is a non-executing local machine gate. Smoke starts
    relay, host, and viewer children and belongs only to default aggregate
    readiness.

## Risks / Trade-offs

- Extra smoke runtime when explicitly enabled -> keep default skipped metadata
  only and require a named opt-in flag.
- Token diagnostics could accidentally leak -> reuse the existing smoke JSON
  sanitizer and never include child command lines or child output in readiness
  output.
- Confusion between local LAN-style smoke and real LAN exposure -> document
  that the combined smoke remains same-machine and does not bind the relay to
  LAN interfaces.
