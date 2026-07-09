## ADDED Requirements

### Requirement: MVP evidence failures report bounded missing flags

The strict MVP audit evidence gate SHALL report bounded missing evidence
metadata when required role-bound evidence is absent. The metadata MUST use
only fixed role/flag identifiers from the reviewed required MVP evidence set,
formatted as `host.<flag>` or `viewer.<flag>`, and MUST be deterministic,
deduplicated, and sorted by the reviewed required evidence order.

Text failure output MAY include one `missingEvidence=` line only for the fixed
`missing-required-evidence` reason. JSON failure output MAY include a
`missingEvidence` array only for that same reason. The audit summary and trial
evidence helpers MUST NOT include raw audit records, local paths, event ids,
actor ids, target ids, session ids, authorization ids, display names, private
reasons, pointer coordinates, key values, frame bytes, screen content, input
content, clipboard content, file-transfer content, diagnostic content, tokens,
token environment values, pairing codes, credentials, generated commands,
stdout, stderr, child output, or full secrets in missing-evidence diagnostics.

This requirement MUST NOT start relay, host, viewer, browser, capture, input,
sockets, HTTP listeners, services, startup persistence, unattended access,
privilege elevation, remote log retrieval, log upload, hidden sessions,
AV/EDR evasion, or Windows prompt bypass.

#### Scenario: Audit summary reports missing role-bound evidence

- **WHEN** strict audit summary evidence is requested and the explicit local
  audit logs are safe but lack required host or viewer evidence
- **THEN** the helper exits non-zero with `missing-required-evidence`
- **AND** text and JSON diagnostics include only fixed missing role/flag
  identifiers for absent required evidence
- **AND** diagnostics remain metadata-only and secret-safe

#### Scenario: Trial evidence delegates missing diagnostics

- **WHEN** `mvp:trial -- --evidence` delegates to the strict audit summary
  gate and required evidence is missing
- **THEN** trial evidence failure diagnostics include the same bounded missing
  role/flag identifiers
- **AND** the helper does not expose audit paths, records, identifiers, command
  strings, stdout, stderr, or secrets

#### Scenario: Missing diagnostics are omitted for unrelated failures

- **WHEN** strict audit summary or trial evidence fails because arguments,
  paths, files, JSONL, records, or audit metadata are malformed
- **THEN** diagnostics use only the fixed failure reason
- **AND** no missing-evidence array or line is printed
