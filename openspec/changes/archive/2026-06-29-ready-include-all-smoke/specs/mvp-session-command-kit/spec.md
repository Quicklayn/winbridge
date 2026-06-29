## ADDED Requirements

### Requirement: Ready helper explicitly aggregates all smoke variants

The root MVP ready helper SHALL support an explicit `--include-all-smoke`
option in default aggregate mode. When provided, the helper SHALL run all
existing smoke readiness variants after the default non-smoke readiness checks:
default smoke as `mvp:smoke -- --json`, LAN-style smoke as
`mvp:smoke -- --json --lan-relay`, token-protected smoke as
`mvp:smoke -- --json --token-env WINBRIDGE_RELAY_SHARED_TOKEN`, and LAN-style
token-protected smoke as
`mvp:smoke -- --json --lan-relay --token-env WINBRIDGE_RELAY_SHARED_TOKEN`.
Each smoke step MUST reuse the existing bounded smoke JSON parser and report
only fixed check metadata, safe failure reasons, and sanitized audit summary
metadata.

The helper MUST reject `--include-all-smoke` when combined with
`--include-smoke`, `--include-token-smoke`, `--include-lan-token-smoke`, or any
role-scoped readiness option before running checks. The helper MUST stop on the
first failed check and MUST NOT expose raw token values, token environment
values, child command strings, child environment maps, relay URLs, local URLs,
pairing codes, stdout, stderr, child output, credentials, screen contents,
input contents, clipboard contents, or full secrets in human or JSON output.
The option MUST NOT add or change relay bind settings, host, viewer, capture,
input, authorization, consent, audit, service, startup, privilege, unattended,
AV/EDR evasion, Windows prompt bypass, or hidden-session behavior.

#### Scenario: All-smoke readiness runs every existing smoke variant

- **WHEN** a developer runs `npm run mvp:ready -- --include-all-smoke`
- **THEN** the helper runs the existing default readiness checks
- **AND** it runs `smoke`, `lan-smoke`, `token-smoke`, and `lan-token-smoke`
  after those checks
- **AND** each smoke result is parsed through the same bounded smoke JSON
  readiness path
- **AND** readiness output reports only bounded fixed status and smoke subcheck
  metadata

#### Scenario: All-smoke rejects ambiguous combinations

- **WHEN** a developer combines `--include-all-smoke` with `--include-smoke`,
  `--include-token-smoke`, `--include-lan-token-smoke`, `--role relay`,
  `--role host`, or `--role viewer`
- **THEN** the helper rejects the arguments before running checks
- **AND** diagnostics do not echo raw unsafe input, token values, command
  strings, relay URLs, local URLs, pairing codes, stdout, stderr, child output,
  credentials, screen contents, input contents, clipboard contents, or full
  secrets

#### Scenario: Default readiness remains non-smoke unless explicitly requested

- **WHEN** a developer runs `npm run mvp:ready` without smoke flags
- **THEN** readiness output marks `smoke`, `lan-smoke`, `token-smoke`, and
  `lan-token-smoke` as skipped metadata only
- **AND** it does not start relay, host, viewer, browser, smoke children,
  capture, input, sockets, HTTP listeners, services, startup persistence,
  unattended access, privilege elevation, LAN discovery, firewall changes,
  AV/EDR evasion, Windows prompt bypass, or hidden-session behavior

### Requirement: Smoke helper does not inherit ambient relay token by default

The root MVP smoke helper MUST NOT implicitly configure the local relay with an
ambient `WINBRIDGE_RELAY_SHARED_TOKEN` value from the parent process unless the
smoke invocation explicitly includes `--token-env`. Default smoke and LAN-style
smoke MUST remain tokenless even when the parent shell has
`WINBRIDGE_RELAY_SHARED_TOKEN` set for other checks. Token-protected smoke MUST
continue to pass the resolved bounded token only when `--token-env` is
provided. Human and JSON smoke output MUST NOT expose raw token values, token
environment values, child command strings, child environment maps, relay URLs,
pairing codes, stdout, stderr, child output, credentials, screen contents,
input contents, clipboard contents, or full secrets.

#### Scenario: Default smoke ignores ambient relay token

- **WHEN** a developer runs `npm run mvp:smoke -- --json` from a shell where
  `WINBRIDGE_RELAY_SHARED_TOKEN` is set
- **THEN** the smoke helper starts its local relay without that shared-token
  configuration
- **AND** the existing tokenless host and viewer smoke children can connect
  through the local relay
- **AND** smoke output reports only bounded fixed check metadata

#### Scenario: Explicit token smoke still configures relay token

- **WHEN** a developer runs
  `npm run mvp:smoke -- --json --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
- **THEN** the smoke helper starts its local relay with the resolved bounded
  shared-token value
- **AND** it passes the same token to host and viewer through their existing
  token option
- **AND** diagnostics remain bounded and secret-safe
