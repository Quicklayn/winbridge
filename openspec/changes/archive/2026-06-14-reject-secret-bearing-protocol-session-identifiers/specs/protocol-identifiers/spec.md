## ADDED Requirements

### Requirement: Protocol session identifiers reject secret-bearing metadata
The protocol package SHALL reject every protocol envelope whose base `sessionId` contains secret-bearing protocol identifier metadata. Secret-bearing protocol session identifiers MUST include raw token, credential, password, passphrase, secret, pairing-code, API-key, access-key, cookie, private-key, SSH-key, authorization, authorization-header, auth-header, or proxy-authorization marker families. Rejection MUST occur before protocol parsing, encoding, relay registration, relay room lookup, relay forwarding, accepted-forward audit, or runtime trusted-event use. Rejection diagnostics MUST remain bounded and MUST NOT expose the raw rejected `sessionId`.

#### Scenario: Secret-bearing protocol session id is rejected
- **WHEN** any protocol envelope is parsed or encoded with a `sessionId` containing a secret-bearing marker family
- **THEN** validation rejects the envelope before returning or encoding trusted protocol data
- **AND** diagnostics MUST NOT expose the raw `sessionId`

#### Scenario: Relay rejects secret-bearing forwarded session id
- **WHEN** a registered peer sends a protocol message whose `sessionId` contains secret-bearing metadata
- **THEN** the relay rejects the message before room lookup, forwarding it to another peer, or writing accepted-forward audit detail
- **AND** peer-facing relay errors and invalid-message audit reasons MUST NOT expose the raw `sessionId`

#### Scenario: Safe protocol session id remains accepted
- **WHEN** a protocol envelope uses a schema-valid non-secret development session id or UUID-derived session id
- **THEN** validation accepts that `sessionId` when all other message requirements pass

#### Scenario: Session id rejection remains non-authorizing
- **WHEN** protocol session id validation rejects secret-bearing metadata
- **THEN** the rejection MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect peers, suppress host visibility, sync clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows
