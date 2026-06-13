## MODIFIED Requirements

### Requirement: Signal payload safety
The relay and agents SHALL reject `signal` protocol messages whose payload omits a top-level string `authorizationId`, carries a malformed payload `authorizationId`, is empty, exceeds the configured protocol payload size bound, contains property names with ASCII control characters or Unicode bidirectional or zero-width formatting controls including `U+FEFF`, or contains keys that indicate raw tokens, credentials, passwords, passphrases, pairing codes, API keys, authorization headers, auth headers, cookies, private keys, keystrokes, keylogging content, screenshots, screen data, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or secrets. Non-secret lifecycle identifiers such as `authorizationId` MUST remain permitted.

#### Scenario: Small signaling payload is accepted
- **WHEN** a registered peer sends a `signal` message containing a non-empty small signaling payload with a valid top-level `authorizationId` and without sensitive key names
- **THEN** the relay accepts the message as schema-valid and may forward it to the remaining peer

#### Scenario: Lifecycle authorization identifier is accepted
- **WHEN** a registered peer sends a `signal` message containing `authorizationId` as a non-secret lifecycle identifier and no sensitive key names
- **THEN** the relay accepts the message as schema-valid and may forward it to the remaining peer

#### Scenario: Missing signal authorization identifier is rejected
- **WHEN** a registered peer sends a `signal` message whose payload omits top-level `authorizationId`
- **THEN** the relay rejects the message before forwarding it

#### Scenario: Malformed signal authorization identifier is rejected
- **WHEN** a registered peer sends a `signal` message whose payload `authorizationId` is not a valid protocol identifier string
- **THEN** the relay rejects the message before forwarding it

#### Scenario: Empty signal payload is rejected
- **WHEN** a registered peer sends a `signal` message with an empty payload object
- **THEN** the relay rejects the message before forwarding it

#### Scenario: Oversized signal payload is rejected
- **WHEN** a registered peer sends a `signal` message whose serialized payload exceeds the protocol payload size bound
- **THEN** the relay rejects the message before forwarding it

#### Scenario: Unsafe signal payload property names are rejected
- **WHEN** a registered peer sends a `signal` message whose payload contains a property name with an ASCII control character or Unicode bidirectional or zero-width formatting control including `U+FEFF` at any nesting level
- **THEN** the relay and agents reject the message before forwarding, encoding, sending, receiving, or treating the payload as trusted remote-assistance signaling metadata
- **AND** diagnostics MUST NOT expose the raw unsafe property name or payload value

#### Scenario: Sensitive signal payload keys are rejected
- **WHEN** a registered peer sends a `signal` message whose payload contains a token, credential, password, passphrase, pairing code, API key, authorization header, auth header, cookie, private key, keystroke, screenshot, screen data, screen content, clipboard content, file-transfer content/data/bytes, diagnostics content/dump, or secret key at any nesting level
- **THEN** the relay rejects the message before forwarding it and MUST NOT treat the payload as trusted remote-assistance data

#### Scenario: Keylogging signal payload keys are rejected
- **WHEN** a registered peer sends a `signal` message whose payload contains keylogging-related field names such as `keylog`, `rawKeylog`, `keylogger`, or `keyloggerOutput` at any nesting level
- **THEN** the relay rejects the message before forwarding it and MUST NOT treat the payload as trusted remote-assistance data

#### Scenario: Passphrase signal payload keys are rejected
- **WHEN** a registered peer sends a `signal` message whose payload contains passphrase-bearing field names such as `passphrase`, `passPhrase`, `pass-phrase`, or `raw_passphrase` at any nesting level
- **THEN** the relay and agents reject the message before forwarding, encoding, sending, receiving, or treating the payload as trusted remote-assistance signaling metadata
- **AND** the rejection MUST NOT expose the raw passphrase value
