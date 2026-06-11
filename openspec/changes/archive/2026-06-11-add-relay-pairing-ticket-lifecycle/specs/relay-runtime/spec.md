## ADDED Requirements

### Requirement: Development pairing ticket runtime configuration
The relay runtime SHALL allow development pairing ticket TTL and maximum-use settings to be configured for tests and local execution.

#### Scenario: Runtime uses injected pairing settings
- **WHEN** tests create the relay runtime with explicit pairing ticket TTL and maximum-use settings
- **THEN** the runtime uses those settings for host-created relay pairing tickets

#### Scenario: CLI uses environment pairing settings
- **WHEN** the relay CLI starts with pairing ticket environment variables
- **THEN** the runtime uses those values for development pairing tickets

### Requirement: Pairing lifecycle audit safety
The relay runtime SHALL emit secret-safe audit events for pairing ticket creation, consumption, and denied pairing joins.

#### Scenario: Pairing join is accepted
- **WHEN** a viewer consumes a valid relay pairing ticket
- **THEN** the relay audit details include safe metadata such as role, room size, ticket consumption status, and remaining use count without raw pairing codes

#### Scenario: Pairing join is denied
- **WHEN** a viewer join is rejected because pairing material is missing, mismatched, expired, or consumed
- **THEN** the relay audit details include safe reason metadata without raw pairing codes, credentials, tokens, protocol payloads, keystrokes, screenshots, or screen contents
