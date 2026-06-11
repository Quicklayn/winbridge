## ADDED Requirements

### Requirement: Raw relay message size limit
The relay SHALL reject inbound WebSocket messages whose raw byte length exceeds the relay message size bound at the WebSocket transport cap or before decoding JSON and validating protocol envelopes.

#### Scenario: Oversized relay message is rejected
- **WHEN** a peer sends a WebSocket message larger than the relay message size bound
- **THEN** the relay rejects the message before forwarding it or decoding it as trusted protocol data

#### Scenario: Oversized relay message counts as invalid
- **WHEN** the relay rejects an oversized WebSocket message
- **THEN** the relay records the rejection through the invalid-message path and applies invalid-message rate-limit accounting

#### Scenario: Transport cap rejects oversized relay message
- **WHEN** the WebSocket transport rejects an oversized message before delivering it to the relay message handler
- **THEN** the relay records a secret-safe invalid-message rejection and the sender connection is closed without forwarding the message

#### Scenario: Oversized relay message audit is secret-safe
- **WHEN** the relay audits an oversized WebSocket message rejection
- **THEN** the audit record MUST NOT include raw message bytes, raw tokens, raw pairing codes, credentials, protocol payloads, keystrokes, screenshots, screen contents, or full secrets
