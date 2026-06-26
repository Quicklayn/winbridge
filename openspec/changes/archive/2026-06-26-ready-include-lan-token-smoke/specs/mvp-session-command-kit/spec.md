## ADDED Requirements

### Requirement: Ready helper explicitly aggregates LAN token-env smoke

The root MVP ready helper SHALL support an explicit
`--include-lan-token-smoke` option in default aggregate mode. When provided,
the helper SHALL run the root MVP smoke check in bounded JSON mode with
`--lan-relay --token-env WINBRIDGE_RELAY_SHARED_TOKEN` after the default
non-smoke readiness checks and any explicitly requested default, LAN-style, or
token smoke checks. The `lan-token-smoke` readiness step MUST reuse the
existing bounded smoke JSON parser and report only fixed check metadata, safe
failure reasons, and sanitized audit summary metadata. Without
`--include-lan-token-smoke`, the default helper SHALL mark `lan-token-smoke` as
explicitly skipped metadata only. Role-scoped readiness MUST reject
`--include-lan-token-smoke`.

The helper MUST stop on the first failed check and MUST NOT expose raw token
values, token environment values, child command strings, child environment
maps, relay URLs, pairing codes, stdout, stderr, child output, credentials,
screen contents, input contents, clipboard contents, or full secrets in human
or JSON output. The option MUST NOT change relay bind settings, host, viewer,
capture, input, authorization, consent, audit, service, startup, privilege,
unattended, AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: LAN token-smoke readiness runs only when explicitly requested

- **WHEN** a developer runs
  `npm run mvp:ready -- --include-lan-token-smoke`
- **THEN** the helper runs the existing default readiness checks
- **AND** it runs a `lan-token-smoke` step as
  `npm run mvp:smoke -- --json --lan-relay --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** readiness output reports only bounded fixed status and smoke
  subcheck metadata for `lan-token-smoke`

#### Scenario: LAN token-smoke readiness composes with existing smoke flags

- **WHEN** a developer runs
  `npm run mvp:ready -- --include-smoke --include-token-smoke --include-lan-token-smoke`
- **THEN** the helper runs default smoke, LAN-style smoke, token-smoke, and
  LAN token-smoke after the default readiness checks
- **AND** each smoke result is parsed through the same bounded smoke JSON
  readiness path

#### Scenario: LAN token-smoke is skipped by default and rejected for roles

- **WHEN** a developer runs `npm run mvp:ready` without LAN token-smoke
- **THEN** readiness output marks `lan-token-smoke` as skipped metadata only
- **AND** it does not start relay, host, viewer, or smoke children
- **WHEN** a developer combines `--role relay`, `--role host`, or
  `--role viewer` with `--include-lan-token-smoke`
- **THEN** the helper rejects the arguments before running checks
- **AND** diagnostics remain bounded and secret-safe

#### Scenario: LAN token-smoke does not expose public relay behavior

- **WHEN** a developer includes LAN token-smoke readiness
- **THEN** the smoke workflow remains the reviewed same-machine LAN-style
  smoke path
- **AND** it does not configure LAN or public relay bind settings, discovery,
  firewall changes, services, startup persistence, unattended access, Windows
  capture, OS input application, browser automation, or hidden sessions
