## ADDED Requirements

### Requirement: Bounded relay audit actor identifiers
The relay audit layer SHALL emit schema-valid audit actor identifiers for relay events associated with any valid protocol peer id.

#### Scenario: Short relay peer id remains readable
- **WHEN** the relay writes an audit record for a peer id whose prefixed relay actor id fits the protocol identifier limit
- **THEN** the audit actor id MAY include the readable peer id in the existing `development-relay:<peerId>` form

#### Scenario: Max-length relay peer id is bounded
- **WHEN** the relay writes an audit record for a valid peer id that would exceed the audit actor id limit after prefixing
- **THEN** the audit actor id MUST use a deterministic bounded identifier that passes audit schema validation

#### Scenario: Bounded relay actor metadata is secret-safe
- **WHEN** the relay uses a bounded actor id for an overlong peer id
- **THEN** any additional audit detail metadata MUST be bounded, deterministic, and MUST NOT include raw tokens, raw pairing codes, credentials, protocol payloads, keystrokes, screenshots, screen contents, or full secrets
