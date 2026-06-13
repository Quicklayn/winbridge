## MODIFIED Requirements

### Requirement: Managed agent shell lifecycle
The agent shell SHALL expose a managed runtime with explicit start and stop operations for tests and CLI use. It SHALL send `join-session` when the socket opens. It SHALL reject duplicate active `start()` calls while the same runtime already has a connecting, open, or closing WebSocket. It SHALL send `hello` only after the relay indicates a two-peer room or after receiving an accepted opposite-role peer `hello`, and MUST NOT send `hello` before a relay recipient is available.

#### Scenario: Agent shell starts
- **WHEN** the agent shell runtime starts
- **THEN** it connects to the relay and sends a join message using the same implementation as the CLI

#### Scenario: Relay token remains local to connection setup
- **WHEN** the managed agent shell connects to a token-protected development relay with a configured relay token
- **THEN** local runtime logs and emitted runtime event records MUST NOT include the raw relay token, credentials, pairing codes, protocol payloads, private reasons, keystrokes, screenshots, screen contents, or input contents

#### Scenario: Duplicate active start is rejected
- **WHEN** caller code invokes `start()` while the same managed runtime already has a connecting, open, or closing WebSocket
- **THEN** the runtime rejects the duplicate start before opening another WebSocket, sending join, hello, authorization, lifecycle, signal, control, or audit messages, emitting local protocol events, granting permissions, activating host visibility, reconnecting peers, changing authorization lifecycle state, or bypassing consent workflows

#### Scenario: Start after closed runtime remains valid
- **WHEN** a managed runtime's prior WebSocket is fully closed or stopped
- **THEN** a later explicit `start()` MAY open a fresh relay connection through the normal startup path and reset only connection-scoped local state

#### Scenario: Hello waits for recipient
- **WHEN** the relay returns `relay-ready` with room size 1
- **THEN** the shell MUST NOT send `hello`

#### Scenario: Hello sent when room is paired
- **WHEN** the relay returns `relay-ready` with room size 2 or the shell receives an accepted opposite-role peer `hello`
- **THEN** it sends exactly one `hello` for its local peer before later workflow messages that depend on peer presence
- **AND** sending `hello` MUST NOT approve authorization, activate a visible session, grant permissions, start capture, send input, reconnect a peer, suppress host visibility, or bypass consent workflows
