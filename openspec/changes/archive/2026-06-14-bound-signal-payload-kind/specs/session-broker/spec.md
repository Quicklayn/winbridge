## ADDED Requirements

### Requirement: Signal payload kind metadata is bounded

The relay and agents SHALL reject `signal` protocol messages when the optional top-level `payload.kind` field is present but is not a bounded non-secret signaling classifier. A valid signal payload kind MUST be a string, MUST be non-blank, MUST be already trimmed, MUST use the protocol identifier character set, MUST be 80 characters or less, and MUST NOT contain secret-bearing metadata such as token, credential, password, passphrase, pairing-code, API-key, access-key, cookie, private-key, SSH-key, authorization-header, auth-header, proxy-authorization, keystroke, screenshot, screen-data, screen-content, clipboard-content, file-transfer content/data/bytes, diagnostics content/dump, or secret marker families. Rejecting malformed kind metadata MUST happen before forwarding, encoding, sending, receiving, or treating the signal as trusted remote-assistance signaling metadata, and rejection diagnostics MUST NOT expose the raw `kind` value.

#### Scenario: Safe signal kind remains accepted

- **WHEN** a registered peer sends a `signal` message with a valid authorization id and `payload.kind` set to a bounded non-secret classifier such as `offer`, `answer`, `candidate`, `host-offer`, or `viewer-signal-probe`
- **THEN** the protocol accepts the signal payload if all other signal safety checks pass
- **AND** the kind metadata MUST NOT grant permissions, start capture, send input, start signaling, reconnect peers, invoke host controls, or bypass consent workflows

#### Scenario: Malformed signal kind is rejected

- **WHEN** a peer sends a `signal` message whose `payload.kind` is blank, untrimmed, not a string, too long, or outside the protocol identifier character set
- **THEN** the protocol rejects the signal before forwarding, sending, receiving, or treating it as trusted signaling metadata
- **AND** the rejection MUST NOT expose the raw kind value

#### Scenario: Secret-bearing signal kind is rejected

- **WHEN** a peer sends a `signal` message whose `payload.kind` contains secret-bearing metadata
- **THEN** the protocol rejects the signal before forwarding, sending, receiving, or treating it as trusted signaling metadata
- **AND** the rejection MUST NOT expose raw kind text, raw signal payload values, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or full secrets

#### Scenario: Signal kind remains redacted from diagnostics

- **WHEN** a valid signal message includes bounded `payload.kind`
- **THEN** runtime events, relay errors, logs, and audit output MUST continue to omit raw signal payload contents unless a future OpenSpec change explicitly introduces bounded signal kind observability
- **AND** omitting kind metadata MUST NOT grant permissions, start capture, send input, start signaling, reconnect peers, invoke host controls, or bypass consent workflows
