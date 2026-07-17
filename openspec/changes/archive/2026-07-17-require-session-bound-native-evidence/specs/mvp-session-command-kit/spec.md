## MODIFIED Requirements

### Requirement: MVP ready supports explicit evidence fixture gate

The root `npm run mvp:ready` helper SHALL support an explicit
`--include-evidence-fixture` option that runs the generated local MVP evidence
fixture dry run after the default aggregate readiness checks pass. The option
MUST run the existing fixture helper with bounded JSON verification semantics
equivalent to
`mvp:evidence-fixture -- --verify --session fixture-session --json`, and MUST
accept only a bounded result with `ok=true`, the reviewed host and viewer
fixture record counts, and `verified=true`. The reviewed non-secret fixture
session MUST be explicit in the invocation and MUST NOT be echoed in readiness
output. The default readiness command without this option MUST NOT run the
fixture helper or write fixture files. Role-scoped readiness MUST reject
`--include-evidence-fixture` before running checks.

Readiness output MUST report only fixed check status metadata for the evidence
fixture gate and MUST NOT echo generated fixture paths, raw fixture JSONL, raw
audit records, identifiers, local paths, stdout, stderr, child output, frame
bytes, screen contents, input contents, clipboard contents, credentials,
tokens, token environment values, pairing codes, or full secrets. The
readiness integration MUST NOT start relay, host, viewer, browser, capture,
input, sockets, HTTP listeners, services, startup persistence, unattended
access, privilege elevation, remote log retrieval, log upload, hidden sessions,
AV/EDR evasion, or Windows prompt bypass.

#### Scenario: Ready runs evidence fixture when explicitly included

- **WHEN** a developer runs `npm run mvp:ready -- --include-evidence-fixture`
- **THEN** readiness runs the default aggregate checks first
- **AND** then runs the evidence fixture helper in strict JSON verify mode with
  the explicit reviewed fixture session
- **AND** output reports the fixed `evidence-fixture` check as passed without
  exposing generated fixture paths, identifiers, or raw audit content

#### Scenario: Default ready does not write evidence fixtures

- **WHEN** a developer runs `npm run mvp:ready`
- **THEN** readiness does not include the evidence fixture check
- **AND** it does not run `mvp:evidence-fixture` or write fixture files

#### Scenario: Evidence fixture drift fails closed

- **WHEN** the evidence fixture helper command omits the explicit fixture
  session, exits non-zero, emits malformed JSON, omits reviewed counts, reports
  unexpected counts, or reports `verified=false`
- **THEN** `mvp:ready` fails closed at the fixed `evidence-fixture` check
- **AND** diagnostics do not echo raw helper output, paths, audit records,
  identifiers, stdout, stderr, child output, tokens, pairing codes,
  credentials, or secrets

#### Scenario: Role-scoped ready rejects evidence fixture

- **WHEN** a developer combines `--role relay`, `--role host`, or
  `--role viewer` with `--include-evidence-fixture`
- **THEN** the helper rejects the invocation before running checks
- **AND** diagnostics remain bounded and do not echo raw unsafe input

### Requirement: MVP command kit includes post-run audit summary command

The MVP command kit SHALL include a bounded post-run audit summary command in
full session text output, preflight-only text output, full session JSON output,
and preflight-only JSON output. The command MUST invoke
`npm run mvp:audit-summary` with explicit host and viewer audit paths matching
the command kit's validated host/viewer audit log options, an explicit
`--session` value matching the command kit's validated session option, and the
explicit `--require-mvp-evidence` flag. It MUST be labeled as a post-run
evidence step in text output and MUST remain non-executing during command
generation. The command kit MUST NOT read audit files, inspect runtime
artifacts, start relay, host, viewer, browser, capture, input, services,
startup persistence, unattended access, network listeners, privilege
elevation, remote log retrieval, log upload, hidden sessions, or Windows
prompt bypass while rendering this command.

#### Scenario: Full command plan includes post-run audit summary

- **WHEN** a developer runs `npm run mvp:commands`
- **THEN** text output includes a post-run evidence section with the fixed
  `npm run mvp:audit-summary -- --host ... --viewer ... --session demo --require-mvp-evidence`
  command
- **AND** the section states that the command is read-only and runs after local
  host/viewer audit logs exist
- **AND** command generation does not read audit files or start runtime
  processes

#### Scenario: JSON command plan includes audit summary metadata

- **WHEN** a developer runs `npm run mvp:commands -- --json`
- **THEN** the JSON `commands` array includes a bounded
  `preflight.audit-summary` command entry with the validated expected session
- **AND** the command entry contains only reviewed command text and no raw
  audit records, tokens, pairing codes, stdout, stderr, frame bytes, screen
  contents, input contents, credentials, or secrets

### Requirement: MVP ready validates post-run audit summary command drift

The MVP ready helper SHALL treat the preflight JSON command-plan output as
valid only when it includes the fixed `preflight.audit-summary` command entry
that invokes `npm run mvp:audit-summary` with explicit default host and viewer
audit log paths, the explicit default session id, and the explicit
`--require-mvp-evidence` flag. Missing, duplicate, malformed, non-strict,
session-missing, session-mismatched, token-bearing, or unexpected audit summary
command metadata MUST make the command-plan readiness check fail closed with
bounded status only. The ready helper MUST NOT execute the audit summary
command, read audit files, retrieve logs remotely, upload logs, start runtime
processes, or expose raw command-plan values in failure output.

#### Scenario: Ready accepts reviewed audit summary command metadata

- **WHEN** `npm run mvp:ready` validates bounded preflight command-plan JSON
- **THEN** it accepts one `preflight.audit-summary` command whose command text
  matches the reviewed post-run invocation and default expected session
- **AND** readiness remains non-executing

#### Scenario: Ready fails closed when audit summary command drifts

- **WHEN** preflight command-plan JSON omits `preflight.audit-summary`, omits or
  changes the expected session, or changes it to a non-strict, malformed,
  token-bearing, or unexpected command
- **THEN** `mvp:ready` fails the command-plan readiness check
- **AND** failure output uses bounded status metadata without echoing raw
  command text, paths, tokens, pairing codes, stdout, stderr, raw audit
  contents, frame bytes, screen contents, input contents, credentials, or
  secrets

## ADDED Requirements

### Requirement: MVP trial plan carries the expected session into evidence

The MVP trial helper SHALL render its post-run evidence command with the same
explicit `<session-id>` placeholder used by the relay, host, viewer, and probe
references. The evidence command MUST include
`--session <session-id> --require-mvp-evidence`, MUST remain non-executing, and
MUST NOT infer a session from audit logs or expose concrete session,
authorization, frame, or event identifiers.

#### Scenario: Full trial plan shows session-bound evidence command

- **WHEN** a developer renders the default text or bounded JSON trial plan
- **THEN** the post-run evidence reference carries the explicit session
  placeholder used by the runtime command references
- **AND** plan rendering does not read audit files or start runtime processes

#### Scenario: Evidence role plan remains bounded

- **WHEN** a developer runs `npm run mvp:trial -- --role evidence`
- **THEN** the helper renders only the bounded session-bound post-run evidence
  reference
- **AND** it does not expose concrete session ids, authorization ids, frame or
  event ids, audit content, credentials, tokens, or secrets
