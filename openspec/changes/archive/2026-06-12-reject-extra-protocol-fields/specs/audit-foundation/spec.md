## ADDED Requirements

### Requirement: Audit fixed fields reject unknown metadata
The audit layer SHALL reject unknown fields on fixed-shape audit records, audit actors, audit targets, and protocol `audit-event` envelopes while preserving validated audit detail metadata.

#### Scenario: Audit record has unknown top-level field
- **WHEN** a component creates or writes an audit record with an unknown top-level field
- **THEN** the audit schema MUST reject the record before storage, local emission, console output, file persistence, or protocol encoding

#### Scenario: Audit actor or target has unknown field
- **WHEN** an audit record includes actor or target metadata with an unknown fixed field
- **THEN** the audit schema MUST reject the record before storage or emission

#### Scenario: Protocol audit-event has unknown fixed field
- **WHEN** a protocol `audit-event` message includes an unknown top-level field outside `detail`
- **THEN** the protocol schema MUST reject the message before forwarding, encoding, emitting, or persistence

#### Scenario: Audit detail remains extensible and redacted
- **WHEN** audit detail metadata includes JSON-compatible fields that are not fixed audit record fields
- **THEN** the audit layer SHALL continue to validate JSON compatibility and apply sensitive-field redaction rather than rejecting the detail solely because the key is not predeclared
