## ADDED Requirements

### Requirement: Signal payload safety
The relay and agents SHALL reject `signal` protocol messages whose payload is empty, exceeds the configured protocol payload size bound, or contains keys that indicate raw tokens, credentials, pairing codes, keystrokes, screenshots, screen data, screen contents, or secrets.

#### Scenario: Small signaling payload is accepted
- **WHEN** a registered peer sends a `signal` message containing a non-empty small signaling payload without sensitive key names
- **THEN** the relay accepts the message as schema-valid and may forward it to the remaining peer

#### Scenario: Empty signal payload is rejected
- **WHEN** a registered peer sends a `signal` message with an empty payload object
- **THEN** the relay rejects the message before forwarding it

#### Scenario: Oversized signal payload is rejected
- **WHEN** a registered peer sends a `signal` message whose serialized payload exceeds the protocol payload size bound
- **THEN** the relay rejects the message before forwarding it

#### Scenario: Sensitive signal payload keys are rejected
- **WHEN** a registered peer sends a `signal` message whose payload contains a token, credential, pairing code, keystroke, screenshot, screen data, screen content, or secret key at any nesting level
- **THEN** the relay rejects the message before forwarding it and MUST NOT treat the payload as trusted remote-assistance data
