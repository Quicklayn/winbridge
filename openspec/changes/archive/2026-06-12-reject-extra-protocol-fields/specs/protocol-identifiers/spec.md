## ADDED Requirements

### Requirement: Fixed-shape protocol objects reject unknown fields
The system SHALL reject unknown fields on fixed-shape protocol-facing objects before using them for relay registration, forwarding, authorization, pairing, session grants, or audit-related protocol metadata.

#### Scenario: Protocol envelope has unknown fixed field
- **WHEN** a protocol envelope includes an unknown top-level field outside its message schema
- **THEN** schema validation MUST reject the envelope before relay registration, forwarding, authorization, pairing, or audit-related protocol use

#### Scenario: Nested fixed protocol object has unknown field
- **WHEN** a protocol-facing fixed nested object such as device identity, audit actor metadata, or audit target metadata includes an unknown field
- **THEN** schema validation MUST reject the object before the nested metadata can be trusted

#### Scenario: Extensible metadata containers remain supported
- **WHEN** a `signal.payload`, protocol `audit-event.detail`, or audit record `detail` object contains JSON-compatible non-sensitive metadata
- **THEN** schema validation MAY preserve that metadata according to the existing payload/detail validation and redaction rules
