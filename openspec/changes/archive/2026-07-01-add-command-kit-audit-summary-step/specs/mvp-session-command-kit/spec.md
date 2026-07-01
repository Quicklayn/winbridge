## ADDED Requirements

### Requirement: MVP command kit includes post-run audit summary command

The MVP command kit SHALL include a bounded post-run audit summary command in
full session text output, preflight-only text output, full session JSON output,
and preflight-only JSON output. The command MUST invoke
`npm run mvp:audit-summary` with explicit host and viewer audit paths matching
the command kit's validated host/viewer audit log options, MUST be labeled as a
post-run evidence step in text output, and MUST remain non-executing during
command generation. The command kit MUST NOT read audit files, inspect runtime
artifacts, start relay, host, viewer, browser, capture, input, services,
startup persistence, unattended access, network listeners, privilege
elevation, remote log retrieval, log upload, hidden sessions, or Windows prompt
bypass while rendering this command.

#### Scenario: Full command plan includes post-run audit summary

- **WHEN** a developer runs `npm run mvp:commands`
- **THEN** the text output includes a post-run evidence section with the fixed
  `npm run mvp:audit-summary -- --host ... --viewer ...` command
- **AND** the section states that the command is read-only and runs after local
  host/viewer audit logs exist
- **AND** command generation does not read the audit files or start runtime
  processes

#### Scenario: JSON command plan includes audit summary metadata

- **WHEN** a developer runs `npm run mvp:commands -- --json`
- **THEN** the JSON `commands` array includes a bounded
  `preflight.audit-summary` command entry
- **AND** the command entry contains only the reviewed audit summary command
  text and no raw audit records, tokens, pairing codes, stdout, stderr, frame
  bytes, screen contents, input contents, credentials, or secrets

### Requirement: MVP ready validates post-run audit summary command drift

The MVP ready helper SHALL treat the preflight JSON command-plan output as
valid only when it includes the fixed `preflight.audit-summary` command entry
that invokes `npm run mvp:audit-summary` with explicit default host and viewer
audit log paths. Missing, duplicate, malformed, token-bearing, or unexpected
audit summary command metadata MUST make the command-plan readiness check fail
closed with bounded status only. The ready helper MUST NOT execute the audit
summary command, read audit files, retrieve logs remotely, upload logs, start
runtime processes, or expose raw command-plan values in failure output.

#### Scenario: Ready accepts reviewed audit summary command metadata

- **WHEN** `npm run mvp:ready` validates the bounded preflight command-plan JSON
- **THEN** it accepts a single `preflight.audit-summary` command whose command
  text matches the reviewed post-run audit summary invocation
- **AND** readiness remains non-executing

#### Scenario: Ready fails closed when audit summary command drifts

- **WHEN** the preflight command-plan JSON omits `preflight.audit-summary` or
  changes it to a malformed, token-bearing, or unexpected command
- **THEN** `mvp:ready` fails the command-plan readiness check
- **AND** failure output uses bounded status metadata without echoing raw
  command text, paths, tokens, pairing codes, stdout, stderr, raw audit
  contents, frame bytes, screen contents, input contents, credentials, or
  secrets
