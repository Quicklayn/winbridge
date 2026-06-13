## MODIFIED Requirements

### Requirement: Audit record validation
The system SHALL validate audit records before storing or emitting them through audit sinks. Audit records MUST reject blank, whitespace-only, oversized, untrimmed, ASCII control-character, or Unicode bidirectional or zero-width formatting-control semantic metadata fields, including action, optional reason, and target type.

#### Scenario: Audit record action is blank
- **WHEN** a component writes an audit record with an empty or whitespace-only action
- **THEN** the audit sink rejects the record before storing or emitting meaningless action metadata

#### Scenario: Audit record action is untrimmed
- **WHEN** a component writes an audit record with an action containing leading or trailing whitespace
- **THEN** the audit sink rejects the record before storing or emitting ambiguous action metadata

#### Scenario: Audit record action contains unsafe characters
- **WHEN** a component writes an audit record with an action containing an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the audit sink rejects the record before storing or emitting ambiguous action metadata

#### Scenario: Audit record reason is blank
- **WHEN** a component writes an audit record with a whitespace-only reason
- **THEN** the audit sink rejects the record instead of storing meaningless reason metadata

#### Scenario: Audit record reason is untrimmed
- **WHEN** a component writes an audit record with a top-level reason containing leading or trailing whitespace
- **THEN** the audit sink rejects the record instead of storing ambiguous reason metadata

#### Scenario: Audit record reason contains unsafe characters
- **WHEN** a component writes an audit record with a top-level reason containing an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the audit sink rejects the record instead of storing ambiguous reason metadata

#### Scenario: Audit record target type is blank
- **WHEN** a component writes an audit record with a target type that is empty or whitespace-only
- **THEN** the audit sink rejects the record before storing meaningless target metadata

#### Scenario: Audit record target type is untrimmed
- **WHEN** a component writes an audit record with a target type containing leading or trailing whitespace
- **THEN** the audit sink rejects the record before storing ambiguous target metadata

#### Scenario: Audit record target type contains unsafe characters
- **WHEN** a component writes an audit record with a target type containing an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the audit sink rejects the record before storing ambiguous target metadata

#### Scenario: Audit metadata rejection is fail-closed and secret-safe
- **WHEN** audit semantic metadata validation rejects a record
- **THEN** the rejection MUST NOT approve authorization, activate host visibility, grant permissions, start capture, send input, reconnect a peer, suppress visibility, or bypass consent workflows
- **AND** diagnostics MUST NOT expose raw private audit metadata

### Requirement: Protocol audit-event detail redaction
The system SHALL redact sensitive fields in protocol `audit-event` message details during schema parsing and encoding before the message is emitted, forwarded, or stored by development components. Protocol `audit-event` messages MUST reject blank, whitespace-only, oversized, untrimmed, ASCII control-character, or Unicode bidirectional or zero-width formatting-control action metadata before parsing, forwarding, encoding, or persistence.

#### Scenario: Protocol audit-event detail is redacted during parse
- **WHEN** a protocol `audit-event` contains detail fields with sensitive key names
- **THEN** the protocol schema replaces those values with a redaction marker before returning or encoding the message

#### Scenario: Protocol audit-event detail redaction is recursive
- **WHEN** sensitive detail key names appear inside nested objects or arrays
- **THEN** the protocol schema recursively redacts those sensitive values while preserving non-sensitive metadata

#### Scenario: Protocol audit-event detail rejects non-JSON values
- **WHEN** an `audit-event` protocol message detail contains a non-JSON-compatible value or property shape
- **THEN** the protocol schema rejects the message before it can be forwarded, encoded, emitted, or persisted

#### Scenario: Audit-event action is blank
- **WHEN** an `audit-event` protocol message includes an empty or whitespace-only action
- **THEN** the protocol schema rejects the message before it can be forwarded, encoded, emitted, or persisted with meaningless action metadata

#### Scenario: Audit-event action is untrimmed
- **WHEN** an `audit-event` protocol message includes an action containing leading or trailing whitespace
- **THEN** the protocol schema rejects the message before it can be forwarded, encoded, emitted, or persisted with ambiguous action metadata

#### Scenario: Audit-event action contains unsafe characters
- **WHEN** an `audit-event` protocol message includes an action containing an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the protocol schema rejects the message before it can be forwarded, encoded, emitted, or persisted with ambiguous action metadata
