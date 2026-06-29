## ADDED Requirements

### Requirement: Preflight role filter emits bounded JSON

The MVP command kit SHALL support `--only preflight --json` as a bounded
machine-readable preflight command plan. The output SHALL be equivalent in
shape and command entries to `--preflight-only --json`, including `ok: true`,
`mode: "preflight"`, `nonExecuting: true`, fixed preflight command entries,
and bounded safety strings. The helper MUST remain non-executing and MUST NOT
start relay, host, viewer, browser, smoke, capture, input, sockets, HTTP
listeners, services, startup persistence, unattended access, privilege
elevation, LAN discovery, firewall changes, AV/EDR evasion, Windows prompt
bypass, hidden sessions, clipboard access, file transfer, diagnostics
collection, or credential access.

JSON role-filter output for `relay`, `host`, `viewer`, and `browser` SHALL
remain rejected. `--only preflight --json` SHALL remain incompatible with
`--preflight-only`, `--generate-pairing`, and session-specific command options.

#### Scenario: Preflight-only target prints preflight JSON

- **WHEN** a developer runs `npm run mvp:commands -- --only preflight --json`
- **THEN** the helper emits bounded JSON with `mode` set to `preflight`
- **AND** the command list includes the fixed preflight entries including
  `preflight.ready-all-smoke`
- **AND** the output does not include relay, host, viewer, browser, capture,
  input, service, startup, privilege, unattended, or hidden-session commands

#### Scenario: Runtime role filters remain text-only

- **WHEN** a developer runs `npm run mvp:commands -- --only host --json`
- **THEN** the helper fails with bounded usage text
- **AND** it does not echo unsafe raw values, secrets, command output, stdout,
  stderr, credentials, screen contents, input contents, clipboard contents, or
  full secrets

#### Scenario: Ready validates preflight JSON target drift

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** the ready helper validates the non-executing
  `mvp:commands -- --only preflight --json` output
- **AND** it fails closed if the bounded preflight JSON shape or fixed command
  entries drift
- **AND** readiness diagnostics do not echo generated command strings, token
  references, local URLs, local paths, pairing codes, stdout, stderr, child
  output, credentials, screen contents, input contents, clipboard contents, or
  full secrets
