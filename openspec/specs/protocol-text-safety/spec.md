# protocol-text-safety Specification

## Purpose
Defines shared text-control metadata constraints for protocol-facing schemas that reject ambiguous or unsafe ASCII control characters and Unicode bidirectional or zero-width formatting controls.
## Requirements
### Requirement: Shared unsafe text-control classifier
The protocol package SHALL use shared classifiers for ASCII control-character and Unicode bidirectional or zero-width formatting-control detection across protocol-facing text metadata validation. Protected text metadata MUST include audit action, audit reason, audit target type, audit detail keys, protocol workflow reason, protocol audit-event action, protocol capability, signal payload keys, authorization lifecycle reason, and device identity display name validation. The shared classifiers MUST preserve existing accepted and rejected text values, and rejection diagnostics MUST remain field-specific and bounded.

#### Scenario: Unsafe control metadata is rejected consistently
- **WHEN** protected protocol-facing text metadata contains an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the relevant schema rejects the metadata before parsing, storage, emission, forwarding, authorization, pairing, or use as trusted identity metadata
- **AND** the rejection keeps the existing field-specific diagnostic message without exposing unrelated raw private metadata

#### Scenario: Safe text metadata keeps existing behavior
- **WHEN** protected protocol-facing text metadata contains non-blank, trimmed text without ASCII control characters or Unicode bidirectional or zero-width formatting controls
- **THEN** validation preserves the existing acceptance behavior and all other field-specific constraints still apply

#### Scenario: Shared text classifier remains non-authorizing
- **WHEN** the shared text-control classifier rejects unsafe metadata
- **THEN** the rejection MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect peers, suppress host visibility, sync clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows
