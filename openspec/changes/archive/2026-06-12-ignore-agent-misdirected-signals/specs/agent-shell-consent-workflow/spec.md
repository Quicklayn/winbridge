## ADDED Requirements

### Requirement: Inbound signal peer boundary
The agent shell SHALL ignore decoded inbound `signal` messages that are not addressed to the local runtime peer or that identify the local runtime peer as the sender before emitting local `received` protocol events or received signal summary logs.

#### Scenario: Signal for another peer is ignored
- **WHEN** a host shell receives a decoded `signal` whose `toPeerId` does not equal the local host peer id
- **THEN** the shell MUST NOT emit a local `received` protocol event for that ignored message
- **AND** the shell MUST NOT log a received signal summary for that ignored message

#### Scenario: Self-origin signal is ignored
- **WHEN** a host shell receives a decoded `signal` whose `fromPeerId` equals the local host peer id
- **THEN** the shell MUST NOT emit a local `received` protocol event for that ignored message
- **AND** the shell MUST NOT log a received signal summary for that ignored message

#### Scenario: Ignored signal input remains secret-safe
- **WHEN** the shell ignores a decoded inbound `signal` because of peer routing metadata
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, signal payloads, signal payload keys, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents
