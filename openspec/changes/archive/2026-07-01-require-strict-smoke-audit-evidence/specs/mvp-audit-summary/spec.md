## MODIFIED Requirements

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
