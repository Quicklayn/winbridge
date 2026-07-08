## ADDED Requirements

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
