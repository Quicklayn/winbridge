## ADDED Requirements

### Requirement: Inbound relay-ready peer boundary
The agent shell SHALL ignore decoded inbound `relay-ready` messages whose `peerId` does not match the local runtime peer before emitting local `received` protocol events or using room metadata for presence or authorization request workflow handling.

#### Scenario: Foreign relay-ready is ignored
- **WHEN** a viewer shell receives a decoded `relay-ready` whose `peerId` does not equal the local viewer peer id
- **THEN** the shell MUST NOT send `hello` or `session-authorization-request` because of that message
- **AND** the shell MUST NOT emit a local `received` protocol event for that ignored message

#### Scenario: Ignored foreign relay-ready input remains secret-safe
- **WHEN** the shell ignores a decoded `relay-ready` that identifies a different peer
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, or input contents
