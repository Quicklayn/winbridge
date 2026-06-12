## ADDED Requirements

### Requirement: Inbound session boundary
The agent shell SHALL ignore decoded inbound protocol messages whose `sessionId` does not match the local runtime session before emitting local `received` protocol events or running consent workflow handling.

#### Scenario: Cross-session authorization request is ignored
- **WHEN** a host shell receives a decoded `session-authorization-request` for a different session id
- **THEN** the shell MUST NOT send a host authorization decision, authorization state update, or workflow audit-event for that request
- **AND** the shell MUST NOT emit a local `received` protocol event for that cross-session request

#### Scenario: Cross-session input remains secret-safe
- **WHEN** the shell ignores a decoded inbound protocol message for a different session id
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, or input contents
