## ADDED Requirements

### Requirement: Audit record snapshot types are read-only
The audit layer SHALL expose created audit records and retained in-memory audit history views as read-only TypeScript snapshots. Compile-time read-only audit record fields MUST match the runtime immutable audit record contract and MUST NOT change audit validation, redaction, JSON serialization, local storage, console output, file persistence, protocol `audit-event` behavior, relay routing, authorization behavior, or workflow audit emission behavior.

#### Scenario: Audit record type prevents direct evidence mutation
- **WHEN** TypeScript code receives an audit record returned by the shared audit factory or an audit sink write
- **THEN** the audit record type marks top-level audit evidence, actor metadata, optional target metadata, and detail metadata as read-only
- **AND** the type-level read-only contract MUST NOT emit audit events, rewrite audit evidence, restore redacted values, grant permissions, start capture, send input, reconnect peers, or bypass consent workflows

#### Scenario: Audit input types remain constructible
- **WHEN** TypeScript code constructs audit record inputs or audit detail objects before validation
- **THEN** audit input and detail construction types remain mutable-friendly
- **AND** read-only output typing MUST NOT force callers to mutate returned audit records, bypass validation, skip redaction, or use unstructured logging

#### Scenario: In-memory audit history view type prevents direct collection mutation
- **WHEN** TypeScript code reads records from the in-memory audit sink
- **THEN** the returned history view type is a read-only audit record collection
- **AND** the type-level read-only contract MUST NOT change write order, expose the internal entry array, add audit records, remove audit records, alter persistence behavior, or change audit output semantics
