## ADDED Requirements

### Requirement: Inbound self-hello boundary
The agent shell SHALL ignore decoded inbound `hello` messages whose `peerId` equals the local runtime peer before emitting local `received` protocol events or running peer presence workflow handling.

#### Scenario: Self-hello is ignored
- **WHEN** a host shell receives a decoded `hello` message whose `peerId` equals the local host peer id
- **THEN** the shell MUST NOT send a local `hello` because of that message
- **AND** the shell MUST NOT emit a local `received` protocol event for that ignored message

#### Scenario: Ignored self-hello input remains secret-safe
- **WHEN** the shell ignores a decoded `hello` message that identifies the local peer
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, display names, capability strings, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, or input contents
