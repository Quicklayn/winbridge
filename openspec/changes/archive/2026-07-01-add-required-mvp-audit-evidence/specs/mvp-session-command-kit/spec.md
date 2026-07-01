## ADDED Requirements

### Requirement: MVP command kit prints strict post-run audit evidence gate

The MVP command kit SHALL render the post-run audit evidence command with the
explicit `--require-mvp-evidence` flag for the generated full command plan,
preflight-only text, preflight-only JSON, and `preflight.audit-summary` command
entry. The rendered command MUST continue to use explicit host and viewer audit
paths matching the generated host and viewer commands. The helper MUST remain
non-executing and MUST NOT read audit files, start relay, host, viewer,
browser, capture, input, sockets, HTTP listeners, services, startup
persistence, unattended access, privilege elevation, remote log retrieval, log
upload, LAN discovery, firewall changes, AV/EDR evasion, Windows prompt
bypass, or hidden-session behavior.

#### Scenario: Generated post-run command is strict

- **WHEN** a developer renders the default MVP session command plan
- **THEN** the post-run audit evidence step includes
  `npm run mvp:audit-summary -- --host ... --viewer ... --require-mvp-evidence`
- **AND** the helper only prints commands

#### Scenario: Preflight audit command entry is strict

- **WHEN** a developer renders JSON command-plan output
- **THEN** the `preflight.audit-summary` command entry includes the explicit
  `--require-mvp-evidence` flag
- **AND** it does not include raw audit records, token values, pairing codes,
  frame bytes, input contents, or command execution output

### Requirement: MVP ready validates strict post-run audit command entry

The root MVP ready helper SHALL treat command-plan and preflight command-plan
output as valid only when the fixed `preflight.audit-summary` command entry
uses `npm run mvp:audit-summary` with explicit default host and viewer audit
paths plus the explicit `--require-mvp-evidence` flag. It MUST fail closed if
the flag is missing, duplicated through unexpected command drift, replaced by
an unsafe token option, or combined with unexpected output shape. Failure
output MUST remain bounded and MUST NOT echo generated command strings, audit
paths, token values, token environment values, pairing codes, local URLs,
stdout, stderr, child output, frame bytes, input contents, clipboard contents,
credentials, diagnostics, or full secrets.

#### Scenario: Ready accepts strict audit summary command

- **WHEN** `mvp:ready` validates generated command-plan output
- **THEN** it accepts a single `preflight.audit-summary` command whose command
  text includes `--require-mvp-evidence`
- **AND** readiness output reports only bounded fixed status metadata

#### Scenario: Ready rejects non-strict audit summary command

- **WHEN** generated command-plan output omits the strict audit evidence flag
  from `preflight.audit-summary`
- **THEN** `mvp:ready` fails the command-plan readiness check
- **AND** diagnostics do not echo the generated command text or audit paths
