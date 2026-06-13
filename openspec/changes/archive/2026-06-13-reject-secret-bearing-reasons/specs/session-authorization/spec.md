## ADDED Requirements

### Requirement: Authorization rejects secret-bearing lifecycle reasons
The shared session authorization state machine SHALL reject lifecycle reason text that contains secret-bearing metadata before creating, parsing, or updating authorization state. Secret-bearing metadata MUST include raw token, credential, password, passphrase, pairing-code, API-key, authorization-header, auth-header, cookie, private-key, SSH-key, keystroke, screenshot, screen-data, screen-content, clipboard-content, file-transfer content/data/bytes, diagnostics content/dump, or secret markers when they appear with values. Rejection diagnostics MUST NOT expose the raw reason text.

#### Scenario: Transition reason contains secret-bearing metadata
- **WHEN** a denial, revocation, pause, resume, or termination transition includes a lifecycle reason containing secret-bearing metadata
- **THEN** the authorization state machine rejects the transition before recording or restoring authorization state
- **AND** the rejection does not expose the raw reason text

#### Scenario: Parsed authorization record reason contains secret-bearing metadata
- **WHEN** an authorization record includes reason text containing secret-bearing metadata
- **THEN** the authorization schema rejects the record before action authorization can use it
- **AND** the rejection does not expose the raw reason text

#### Scenario: Safe lifecycle reason remains accepted
- **WHEN** a lifecycle transition or parsed authorization record uses concise non-secret reason text
- **THEN** the authorization layer accepts the reason when all other authorization invariants are valid
