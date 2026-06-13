## ADDED Requirements

### Requirement: Keylogging audit reason redaction

The audit layer SHALL redact top-level audit `reason` values that contain
obvious keylogging-related markers with raw values before records are returned,
stored, emitted, encoded, forwarded, or persisted. Redaction MUST NOT authorize
keylogging, input capture, screen capture, clipboard access, file transfer,
diagnostics collection, hidden sessions, or consent bypass.

#### Scenario: Keylogging audit reason is redacted

- **WHEN** a component creates an audit record with a top-level `reason`
  containing a keylogging-related marker such as `keylog`, `rawKeylog`, or
  `keyloggerOutput` plus a raw value
- **THEN** the audit layer replaces the reason with `[REDACTED]`
- **AND** the created audit record MUST NOT contain the raw reason text

#### Scenario: Metadata-only keylogging denial reason remains inspectable

- **WHEN** a component creates an audit record with a fixed bounded
  metadata-only reason such as `keylog denied`
- **THEN** the audit layer preserves that safe reason because it does not carry
  raw keylogging content
