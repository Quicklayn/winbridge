## ADDED Requirements

### Requirement: Authorization record fixed identifiers reject secret-bearing metadata
The shared session authorization state machine SHALL reject authorization records whose fixed `sessionId`, `hostPeerId`, or `viewerPeerId` contains secret-bearing protocol identifier metadata before creating, parsing, transitioning, expiring, or using authorization state for remote action authorization. Secret-bearing metadata MUST include raw token, credential, password, passphrase, secret, pairing-code, API-key, access-key, cookie, private-key, SSH-key, authorization, authorization-header, auth-header, or proxy-authorization marker families. Rejection diagnostics MUST NOT expose the raw rejected identifier value.

#### Scenario: Pending authorization fixed identifier contains secret-bearing metadata
- **WHEN** pending authorization creation receives a `sessionId`, `hostPeerId`, or `viewerPeerId` containing secret-bearing protocol identifier metadata
- **THEN** authorization creation rejects the input before creating pending authorization state
- **AND** the rejection MUST NOT expose the raw rejected identifier

#### Scenario: Parsed authorization fixed identifier contains secret-bearing metadata
- **WHEN** a parsed authorization record contains a secret-bearing `sessionId`, `hostPeerId`, or `viewerPeerId`
- **THEN** schema validation rejects the record before any lifecycle transition, expiration check, or remote action authorization can use it
- **AND** the rejection MUST NOT expose the raw rejected identifier

#### Scenario: Safe authorization fixed identifiers remain valid
- **WHEN** an authorization record uses schema-valid non-secret `sessionId`, `hostPeerId`, and `viewerPeerId`
- **THEN** the authorization layer accepts those identifiers when all other consent, visibility, expiration, and permission-scope requirements pass

#### Scenario: Authorization fixed identifier rejection preserves fail-closed behavior
- **WHEN** authorization fixed identifier validation rejects secret-bearing metadata
- **THEN** the rejection MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect peers, suppress host visibility, sync clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows
