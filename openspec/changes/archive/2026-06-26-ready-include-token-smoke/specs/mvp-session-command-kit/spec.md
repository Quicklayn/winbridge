# Delta: MVP session command kit

## ADDED Requirements

### Requirement: Ready helper explicitly aggregates token-env smoke

The root MVP ready helper SHALL support an explicit `--include-token-smoke`
option in default aggregate mode. When provided, the helper SHALL run the root
MVP smoke check in bounded JSON mode with
`--token-env WINBRIDGE_RELAY_SHARED_TOKEN` after the default non-smoke
readiness checks and any explicitly requested default/LAN smoke checks. The
token-smoke readiness step MUST reuse the existing bounded smoke JSON parser
and report only fixed check metadata, safe failure reasons, and sanitized audit
summary metadata. Without `--include-token-smoke`, the default helper SHALL
mark token-smoke as explicitly skipped metadata only. Role-scoped readiness
MUST reject `--include-token-smoke`. The helper MUST stop on the first failed
check and MUST NOT expose raw token values, token environment values, child
command strings, child environment maps, relay URLs, pairing codes, stdout,
stderr, child output, credentials, screen contents, input contents, clipboard
contents, or full secrets in human or JSON output. The option MUST NOT change
relay, host, viewer, capture, input, authorization, consent, audit, service,
startup, privilege, unattended, AV/EDR evasion, Windows prompt bypass, or
hidden-session behavior.

#### Scenario: Token-smoke readiness runs only when explicitly requested

- **WHEN** a developer runs `npm run mvp:ready -- --include-token-smoke`
- **THEN** the helper runs the existing default readiness checks
- **AND** it runs a `token-smoke` step as
  `npm run mvp:smoke -- --json --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** readiness output reports only bounded fixed status and smoke
  subcheck metadata for `token-smoke`

#### Scenario: Token-smoke readiness can combine with default smoke

- **WHEN** a developer runs
  `npm run mvp:ready -- --include-smoke --include-token-smoke`
- **THEN** the helper runs default smoke, LAN-style smoke, and token-smoke
  after the default readiness checks
- **AND** each smoke result is parsed through the same bounded smoke JSON
  readiness path

#### Scenario: Token-smoke is skipped by default and rejected for roles

- **WHEN** a developer runs `npm run mvp:ready` without token-smoke
- **THEN** readiness output marks `token-smoke` as skipped metadata only
- **AND** it does not start relay, host, viewer, or smoke children
- **WHEN** a developer combines `--role relay`, `--role host`, or
  `--role viewer` with `--include-token-smoke`
- **THEN** the helper rejects the arguments before running checks
- **AND** diagnostics remain bounded and secret-safe

