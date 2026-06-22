## MODIFIED Requirements

### Requirement: JSONL file audit sink

The system SHALL provide a development file audit sink that appends one
schema-valid audit record as JSON per line. For a safe configured file path, the
file audit sink SHALL create the configured file's parent directory recursively
before appending the JSONL record. Directory creation or append failures MUST
surface to the caller instead of silently dropping audit records or falling back
to non-file audit behavior.

#### Scenario: File sink writes records

- **WHEN** two audit records are written to the file sink
- **THEN** the audit file contains two JSON lines in write order

#### Scenario: File sink creates parent directories

- **WHEN** a file audit sink writes an audit record to a safe nested local path
  whose parent directory does not exist
- **THEN** it creates the parent directory recursively before appending the
  JSONL record
- **AND** the persisted record remains schema-valid and redacted
