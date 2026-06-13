## ADDED Requirements

### Requirement: File sink keylogging audit reason redaction

The file audit sink SHALL apply shared keylogging-related top-level audit
`reason` redaction before appending JSONL records.

#### Scenario: Keylogging audit reason is persisted redacted

- **WHEN** a file audit sink writes an audit record whose top-level `reason`
  contains a keylogging-related marker such as `keyloggerOutput` plus a raw value
- **THEN** the persisted JSON line contains `[REDACTED]` for the reason
- **AND** the persisted JSONL content MUST NOT contain the raw keylogging value
