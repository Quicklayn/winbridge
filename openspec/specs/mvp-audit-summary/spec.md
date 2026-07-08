# mvp-audit-summary Specification

## Purpose
Define the read-only MVP audit summary helper used to verify bounded host and
viewer audit evidence after development remote-assistance trials.
## Requirements
### Requirement: MVP audit summary reads explicit local audit logs

The MVP audit summary helper SHALL provide a root
`npm run mvp:audit-summary` command that reads only explicitly supplied local
host and viewer audit JSONL file paths. It MUST require `--host <path>` and
`--viewer <path>`, MUST reject missing, duplicate, blank, untrimmed, oversized,
control-character, Unicode format-control, Windows device, Windows device
namespace, or alternate-data-stream paths before reading files, and MUST NOT
start relay, host, viewer, browser, capture, input, services, startup
persistence, unattended access, network listeners, privilege elevation, remote
log retrieval, log upload, hidden sessions, or Windows prompt bypass. Failure
diagnostics MUST remain bounded and MUST NOT echo raw paths, raw audit lines,
record details, tokens, token environment values, pairing codes, credentials,
display names, private reasons, command strings, stdout, stderr, frame bytes,
screen contents, input contents, clipboard contents, file-transfer contents,
diagnostics, or full secrets.

#### Scenario: Host and viewer audit paths are explicit

- **WHEN** a developer runs
  `npm run mvp:audit-summary -- --host logs\host-audit.jsonl --viewer logs\viewer-audit.jsonl`
- **THEN** the helper reads only those two local files
- **AND** it emits bounded summary metadata without starting runtime processes

#### Scenario: Unsafe audit summary paths fail closed

- **WHEN** a developer omits a required path, repeats an option, or supplies an
  unsafe audit path
- **THEN** the helper rejects the request before reading files
- **AND** diagnostics do not echo the raw path value

### Requirement: MVP audit summary emits bounded evidence only

The MVP audit summary helper SHALL summarize accepted local audit JSONL into
fixed role-scoped counts and fixed evidence flags only. The fixed evidence
flags MUST include authorization approved, active visible authorization, screen
frame sent, screen frame output, input sent, permission revoked, and disconnect
or terminal lifecycle evidence when present in safe audit action/outcome
metadata. Text and JSON output MUST NOT include raw audit record details, event
ids, actor ids, target ids, session ids, authorization ids, display names,
private reasons, pointer coordinates, key values, frame bytes, screen content,
input content, clipboard content, file-transfer content, diagnostic content,
tokens, pairing codes, credentials, local paths, command strings, stdout,
stderr, or full secrets.

#### Scenario: Successful summary reports fixed evidence

- **WHEN** host and viewer audit logs contain schema-like safe MVP audit
  records for approval, active visible authorization, frame send/output, input,
  revocation, and disconnect lifecycle evidence
- **THEN** the helper reports `ok=true`, bounded role counts, and fixed
  coverage flags
- **AND** it does not print raw audit details or identifiers

#### Scenario: JSON summary remains bounded

- **WHEN** the developer runs the helper with `--json`
- **THEN** the helper emits machine-readable metadata containing only `ok`,
  `roles`, and `coverage`
- **AND** the JSON omits raw audit records, paths, details, identifiers, and
  secrets

### Requirement: MVP audit summary rejects malformed audit input

The MVP audit summary helper SHALL reject missing files, unreadable files,
oversized files, oversized lines, malformed JSONL, non-object lines, malformed
audit record shapes, unsafe action/outcome metadata, and secret-bearing audit
actions before emitting a successful summary. Failure output MUST use fixed
reason metadata only and MUST NOT echo raw file contents, raw line contents,
paths, audit details, identifiers, tokens, pairing codes, credentials, screen
contents, input contents, clipboard contents, file-transfer contents,
diagnostics, or full secrets.

#### Scenario: Malformed audit JSONL fails closed

- **WHEN** either audit file contains malformed JSONL or a malformed audit
  record shape
- **THEN** the helper exits non-zero with a bounded fixed reason
- **AND** diagnostics do not expose raw log content

#### Scenario: Oversized audit input fails closed

- **WHEN** either audit file or audit line exceeds the reviewed summary limits
- **THEN** the helper exits non-zero with a bounded fixed reason
- **AND** diagnostics do not expose raw log content

### Requirement: MVP audit summary can require complete MVP evidence

The MVP audit summary helper SHALL support an explicit
`--require-mvp-evidence` option that turns the summary into a fail-closed
post-run gate. When the option is supplied, the helper MUST require accepted
audit outcomes for the fixed MVP evidence flags in their expected local roles:
host authorization approval, host active visible authorization, host screen
frame sent, host permission revoked, host disconnect, host local session
disconnected, or terminal lifecycle evidence, viewer screen frame output,
viewer input sent, and viewer disconnect evidence. Denied or failed audit
outcomes MUST NOT satisfy required MVP evidence. Accepted evidence for the
wrong role MUST NOT satisfy required MVP evidence. If any required role-bound
fixed flag is missing, the helper MUST exit non-zero with the bounded reason
`missing-required-evidence`. Text and JSON failure output MUST NOT echo raw
audit records, record details, paths, event ids, actor ids, target ids, session
ids, authorization ids, display names, private reasons, pointer coordinates,
key values, frame bytes, screen content, input content, clipboard content,
file-transfer content, diagnostic content, tokens, token environment values,
pairing codes, credentials, command strings, stdout, stderr, or full secrets.

#### Scenario: Strict MVP audit evidence passes

- **WHEN** the host audit log contains accepted safe records for authorization
  approval, active visible authorization, screen frame sent, permission revoked,
  and host disconnect, host local session disconnected, or terminal lifecycle
  evidence
- **AND** the viewer audit log contains accepted safe records for screen frame
  output, input sent, and viewer disconnect evidence
- **AND** the developer runs
  `npm run mvp:audit-summary -- --host logs\host-audit.jsonl --viewer logs\viewer-audit.jsonl --require-mvp-evidence`
- **THEN** the helper exits successfully and reports bounded evidence metadata
- **AND** it does not print raw audit records, paths, identifiers, or secrets

#### Scenario: Missing strict MVP audit evidence fails closed

- **WHEN** either explicit audit log lacks one or more fixed required MVP
  evidence flags for its expected role
- **AND** the developer supplies `--require-mvp-evidence`
- **THEN** the helper exits non-zero with the bounded reason
  `missing-required-evidence`
- **AND** diagnostics do not expose raw logs, paths, identifiers, frame bytes,
  input contents, command strings, or secrets

#### Scenario: Wrong-role audit evidence fails closed

- **WHEN** accepted host-required evidence appears only in the viewer audit log
  or accepted viewer-required evidence appears only in the host audit log
- **AND** the developer supplies `--require-mvp-evidence`
- **THEN** the helper exits non-zero with the bounded reason
  `missing-required-evidence`
- **AND** diagnostics remain metadata-only

#### Scenario: Denied or failed audit outcomes do not satisfy strict evidence

- **WHEN** host and viewer audit logs contain only denied or failed records for
  one or more required MVP evidence actions
- **AND** the developer supplies `--require-mvp-evidence`
- **THEN** the helper exits non-zero with the bounded reason
  `missing-required-evidence`
- **AND** diagnostics remain metadata-only

#### Scenario: Non-strict audit summary remains available

- **WHEN** host and viewer audit logs are safe and parseable but only contain
  partial or wrong-role MVP evidence
- **AND** the developer omits `--require-mvp-evidence`
- **THEN** the helper still emits the bounded summary and coverage flags
- **AND** the output remains metadata-only

### Requirement: MVP trial helper verifies explicit post-run audit evidence

The root `npm run mvp:trial` helper SHALL support an explicit evidence mode
that validates a completed two-PC development MVP trial by delegating to the
existing strict audit-summary gate. Evidence mode MUST require explicit local
`--host-audit <path>` and `--viewer-audit <path>` arguments, MUST invoke the
equivalent of
`mvp:audit-summary -- --host <path> --viewer <path> --require-mvp-evidence`,
and MUST fail closed when the strict summary fails. It MUST reject missing,
duplicate, malformed, blank, untrimmed, oversized, control-character, Unicode
format-control, Windows device, Windows device namespace, or alternate-data
stream path arguments before delegation. Text and JSON diagnostics MUST remain
bounded and MUST NOT echo raw paths, raw audit records, record details, event
ids, actor ids, target ids, session ids, authorization ids, display names,
private reasons, pointer coordinates, key values, frame bytes, screen content,
input content, clipboard content, file-transfer content, diagnostic content,
tokens, token environment values, pairing codes, credentials, generated
commands, stdout, stderr, or full secrets. Evidence mode MUST NOT start relay,
host, viewer, browser, capture, input, services, startup persistence,
unattended access, network listeners, privilege elevation, remote log
retrieval, log upload, hidden sessions, AV/EDR evasion, or Windows prompt
bypass.

#### Scenario: Trial evidence passes with strict audit evidence

- **WHEN** a developer runs
  `npm run mvp:trial -- --evidence --host-audit logs\host-audit.jsonl --viewer-audit logs\viewer-audit.jsonl`
- **AND** the strict audit-summary gate finds complete role-bound MVP evidence
- **THEN** the helper exits successfully and reports bounded evidence status
- **AND** it does not print raw audit records, paths, identifiers, or secrets

#### Scenario: Trial evidence fails when strict evidence is missing

- **WHEN** the explicit host or viewer audit log lacks required role-bound MVP
  evidence
- **AND** the developer runs the trial helper in evidence mode
- **THEN** the helper exits non-zero with bounded fixed diagnostics
- **AND** diagnostics do not expose raw logs, paths, identifiers, frame bytes,
  input contents, command strings, stdout, stderr, or secrets

#### Scenario: Trial evidence rejects unsafe audit paths

- **WHEN** a developer omits a required audit path, repeats an audit path
  option, or supplies an unsafe audit path
- **THEN** the helper rejects the request before invoking audit-summary
- **AND** diagnostics do not echo the raw path value
