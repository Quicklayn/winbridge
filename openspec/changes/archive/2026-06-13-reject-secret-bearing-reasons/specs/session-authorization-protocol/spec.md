## ADDED Requirements

### Requirement: Protocol rejects secret-bearing authorization reasons
Authorization protocol envelopes SHALL reject authorization-related reason text that contains secret-bearing metadata before parsing, encoding, forwarding, trusted runtime event emission, persistence, or workflow processing. Secret-bearing metadata MUST include raw token, credential, password, passphrase, pairing-code, API-key, authorization-header, auth-header, cookie, private-key, SSH-key, keystroke, screenshot, screen-data, screen-content, clipboard-content, file-transfer content/data/bytes, diagnostics content/dump, or secret markers when they appear with values. Rejection diagnostics MUST NOT expose the raw reason text.

#### Scenario: Request or decision reason contains secret-bearing metadata
- **WHEN** a host consent, session authorization request, or session authorization decision message includes reason text containing secret-bearing metadata
- **THEN** protocol validation rejects the message before forwarding or workflow processing
- **AND** the rejection does not expose the raw reason text

#### Scenario: State or control reason contains secret-bearing metadata
- **WHEN** a session authorization state, permission revocation, or session control message includes reason text containing secret-bearing metadata
- **THEN** protocol validation rejects the message before forwarding, persistence, or workflow processing
- **AND** the rejection does not expose the raw reason text

#### Scenario: Safe authorization reason remains accepted
- **WHEN** an authorization-related protocol message uses concise non-secret reason text
- **THEN** protocol validation accepts the reason when all other message invariants are valid
