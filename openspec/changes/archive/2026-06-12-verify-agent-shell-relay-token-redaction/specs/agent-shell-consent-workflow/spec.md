## MODIFIED Requirements

### Requirement: Managed agent shell lifecycle
The agent shell SHALL expose a managed runtime with explicit start and stop operations for tests and CLI use. It SHALL send `join-session` when the socket opens. It SHALL send `hello` only after the relay indicates a two-peer room or after receiving a peer `hello`, and MUST NOT send `hello` before a relay recipient is available.

#### Scenario: Agent shell starts
- **WHEN** the managed agent shell starts with valid relay, session, pairing, role, peer, and device metadata
- **THEN** it connects to the relay and sends a schema-valid `join-session` message

#### Scenario: Relay token remains local to connection setup
- **WHEN** the managed agent shell connects to a token-protected development relay with a configured relay token
- **THEN** local runtime logs and emitted runtime event records MUST NOT include the raw relay token, credentials, pairing codes, protocol payloads, private reasons, keystrokes, screenshots, screen contents, or input contents

#### Scenario: Hello waits for recipient
- **WHEN** only one peer has joined a brokered relay room
- **THEN** the shell MUST NOT send `hello`

#### Scenario: Hello sent when room is paired
- **WHEN** the relay indicates a two-peer room or the shell receives a peer `hello`
- **THEN** the shell sends a schema-valid `hello` message with local device metadata
- **AND** sending `hello` MUST NOT approve authorization, activate a visible session, grant permissions, start capture, send input, reconnect a peer, suppress host visibility, or bypass consent workflows
