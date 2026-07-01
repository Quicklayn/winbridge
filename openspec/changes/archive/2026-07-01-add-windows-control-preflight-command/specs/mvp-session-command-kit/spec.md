## ADDED Requirements

### Requirement: Command kit prints Windows control preflight gate

The MVP command kit SHALL include a fixed Windows control smoke readiness gate
in generated full-session, preflight-only, and JSON command-plan output. Human
output SHALL show `npm run mvp:ready -- --include-windows-control-smoke` as an
explicit native Windows control preflight command before a two-PC MVP trial.
JSON output SHALL include a fixed command entry named
`preflight.ready-windows-control-smoke` whose command is exactly
`npm run mvp:ready -- --include-windows-control-smoke`. The root ready helper's
command-plan validation SHALL require that fixed command entry in addition to
the existing preflight, relay, host, viewer, and browser command entries.

This command entry MUST remain non-executing command-plan output and MUST NOT
start relay, host, viewer, browser, smoke, capture, input, sockets, HTTP
listeners, services, startup persistence, unattended access, privilege
elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows prompt
bypass, hidden sessions, clipboard access, file transfer, diagnostics
collection, credential access, or hidden capture/input activity. The entry MUST
remain separate from `--include-all-smoke`.

#### Scenario: Full command plan prints Windows control preflight

- **WHEN** a developer runs `npm run mvp:commands`
- **THEN** the full command plan includes
  `npm run mvp:ready -- --include-windows-control-smoke` in the preflight
  section
- **AND** it indicates the gate is explicit native Windows control smoke
  coverage
- **AND** the helper still prints commands only

#### Scenario: Preflight-only output prints Windows control preflight

- **WHEN** a developer runs `npm run mvp:commands -- --preflight-only`
- **THEN** the preflight-only output includes
  `npm run mvp:ready -- --include-windows-control-smoke`
- **AND** it does not include relay, host, viewer, browser, capture, input,
  service, startup, privilege, unattended, or hidden-session commands

#### Scenario: JSON command plan exposes fixed Windows control entry

- **WHEN** a developer runs `npm run mvp:commands -- --json`
- **THEN** the JSON command list includes a fixed
  `preflight.ready-windows-control-smoke` command entry
- **AND** `mvp:ready` command-plan validation requires that fixed entry
- **AND** readiness diagnostics do not echo generated command strings, token
  references, relay URLs, local URLs, local paths, pairing codes, stdout,
  stderr, child output, credentials, screen contents, input contents,
  clipboard contents, or full secrets

#### Scenario: Windows control preflight remains explicit

- **WHEN** a developer runs `npm run mvp:ready -- --include-all-smoke`
- **THEN** the ready helper still does not run the combined Windows control
  smoke
- **AND** no `mvp:smoke -- --windows-capture --windows-input` command is
  planned unless `--include-windows-control-smoke` is supplied explicitly
