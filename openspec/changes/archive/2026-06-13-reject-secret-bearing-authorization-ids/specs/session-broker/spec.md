## ADDED Requirements

### Requirement: Signal authorization identifiers are non-secret metadata
The relay and agents SHALL reject `signal` protocol messages whose top-level `payload.authorizationId` contains secret-bearing metadata such as token, credential, cookie, API key, access key, private key, SSH key, authorization header, or auth header markers. A secret-bearing `payload.authorizationId` MUST be treated as malformed signal metadata even when it otherwise satisfies the generic protocol identifier shape.

#### Scenario: Secret-bearing signal authorization identifier is rejected
- **WHEN** a registered peer sends a `signal` message whose payload contains a secret-bearing `authorizationId`
- **THEN** the relay and agents reject the message before forwarding, encoding, sending, receiving, or treating the payload as trusted remote-assistance signaling metadata
- **AND** diagnostics MUST NOT expose the raw `authorizationId` value

#### Scenario: Non-secret signal authorization identifier remains valid
- **WHEN** a registered peer sends a `signal` message containing `authorizationId` as a schema-valid non-secret lifecycle identifier and no sensitive key names
- **THEN** the relay accepts the message as schema-valid and may forward it to the remaining peer
