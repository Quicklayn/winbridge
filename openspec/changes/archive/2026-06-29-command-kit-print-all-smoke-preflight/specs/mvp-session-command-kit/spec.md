## ADDED Requirements

### Requirement: Command kit prints all-smoke preflight gate

The MVP command kit SHALL include the all-smoke readiness gate in generated
full-session, preflight-only, and JSON command-plan output. Human output SHALL
show `npm run mvp:ready -- --include-all-smoke` as a local preflight command
for full smoke coverage before a two-PC trial. JSON output SHALL include a
fixed command entry named `preflight.ready-all-smoke`. The root ready helper's
command-plan validation SHALL require that fixed command entry in addition to
the existing preflight, relay, host, viewer, and browser command entries.

When the command kit is rendered with `--token-env <NAME>`, the all-smoke
preflight instruction MAY include an environment-reference assignment from
`$env:<NAME>` to `$env:WINBRIDGE_RELAY_SHARED_TOKEN`, but it MUST NOT print raw
token values or token environment values. The command kit MUST remain
non-executing and MUST NOT start relay, host, viewer, browser, smoke, capture,
input, sockets, HTTP listeners, services, startup persistence, unattended
access, privilege elevation, LAN discovery, firewall changes, AV/EDR evasion,
Windows prompt bypass, hidden sessions, clipboard access, file transfer, or
diagnostics collection.

#### Scenario: Full command plan prints all-smoke preflight

- **WHEN** a developer runs `npm run mvp:commands`
- **THEN** the full command plan includes `npm run mvp:ready -- --include-all-smoke`
  in the preflight section
- **AND** it indicates the gate is for full local smoke coverage
- **AND** the helper still prints commands only

#### Scenario: Token-env command plan keeps all-smoke secret-safe

- **WHEN** a developer runs
  `npm run mvp:commands -- --token-env WINBRIDGE_TEST_RELAY_TOKEN`
- **THEN** the all-smoke preflight instruction references
  `$env:WINBRIDGE_TEST_RELAY_TOKEN` and `$env:WINBRIDGE_RELAY_SHARED_TOKEN`
- **AND** it does not print a token value, command output, stdout, stderr,
  credential, screen content, input content, clipboard content, or full secret

#### Scenario: JSON command plan exposes fixed all-smoke entry

- **WHEN** a developer runs `npm run mvp:commands -- --json`
- **THEN** the JSON command list includes a fixed `preflight.ready-all-smoke`
  command entry
- **AND** `mvp:ready` command-plan validation requires that fixed entry
- **AND** readiness diagnostics do not echo the command string, token
  references, relay URLs, local URLs, local paths, pairing codes, stdout,
  stderr, child output, credentials, screen contents, input contents,
  clipboard contents, or full secrets

#### Scenario: Preflight-only output remains non-executing

- **WHEN** a developer runs `npm run mvp:commands -- --preflight-only`
- **THEN** the preflight-only output includes the all-smoke readiness gate
- **AND** it does not include relay, host, viewer, browser, capture, input,
  service, startup, privilege, unattended, or hidden-session commands
