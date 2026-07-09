# Security Review: add-agent-token-env

## Scope

Reviewed the agent-shell `--token-env` parser path, MVP command rendering,
foreground role runner child argv, smoke helper child argv/env handling, and
MVP readiness drift checks.

## Findings

- No new host consent, visible-session, authorization, capture, input,
  revocation, pause, terminate, disconnect, or audit behavior is introduced.
- `dev:agent` accepts `--token-env <ENV_NAME>` only through a bounded uppercase
  environment variable name pattern and rejects dual `--token` plus
  `--token-env` input before runtime startup.
- Env-resolved token values reuse the existing relay token value validation and
  fail closed for unset, blank, untrimmed, oversized, control-character, bidi,
  and zero-width unsafe values.
- Reviewed MVP host/viewer command text now passes only `--token-env <NAME>` to
  the agent shell. It does not render raw relay token values or `$env:<NAME>`
  token substitutions into agent argv.
- `mvp:run` validates the configured relay token value for live use but passes
  only `--token-env <NAME>` in host/viewer child argv. Sanitized dry-run
  metadata uses `<token-env>` placeholders.
- `mvp:smoke` still configures the relay child with the resolved bounded token
  through the child environment, while host/viewer smoke children receive the
  same value through their environment and use `--token-env` argv markers.
- `mvp:ready` requires reviewed token-env host/viewer command markers and
  rejects raw `--token` runtime argument regressions in role-filter and runner
  dry-run checks.

## Abuse Boundary Check

This change does not add hidden sessions, unattended access, service install,
startup persistence, browser launch, privilege elevation, firewall changes, LAN
discovery, credential access, keylogging, AV/EDR evasion, Windows prompt
bypass, hidden capture, or hidden input.

## Residual Risk

Environment variables are still visible to sufficiently privileged local
processes and are not a production secret-management solution. This is an MVP
hardening step that reduces command-line argv and shell-history exposure in the
reviewed development workflow.
