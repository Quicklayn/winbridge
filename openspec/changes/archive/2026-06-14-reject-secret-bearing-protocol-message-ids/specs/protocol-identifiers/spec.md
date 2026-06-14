## ADDED Requirements

### Requirement: Protocol message identifiers reject secret-bearing metadata
The protocol package SHALL reject every protocol envelope whose base `messageId` contains secret-bearing protocol identifier metadata. Secret-bearing message identifiers MUST include raw token, credential, password, passphrase, secret, pairing-code, API-key, access-key, cookie, private-key, SSH-key, authorization, authorization-header, auth-header, or proxy-authorization marker families. Rejection MUST occur before protocol parsing, encoding, relay forwarding, accepted-forward audit, or runtime trusted-event use. Rejection diagnostics MUST remain bounded and MUST NOT expose the raw rejected `messageId`.

#### Scenario: Secret-bearing protocol message id is rejected
- **WHEN** any protocol envelope is parsed or encoded with a `messageId` containing a secret-bearing marker family
- **THEN** validation rejects the envelope before returning or encoding trusted protocol data
- **AND** diagnostics MUST NOT expose the raw `messageId`

#### Scenario: Relay rejects secret-bearing forwarded message id
- **WHEN** a registered peer sends a protocol message whose `messageId` contains secret-bearing metadata
- **THEN** the relay rejects the message before forwarding it to another peer or writing accepted-forward audit detail
- **AND** peer-facing relay errors and invalid-message audit reasons MUST NOT expose the raw `messageId`

#### Scenario: Safe protocol message id remains accepted
- **WHEN** a protocol envelope uses a schema-valid non-secret UUID or development message id
- **THEN** validation accepts that `messageId` when all other message requirements pass

#### Scenario: Message id rejection remains non-authorizing
- **WHEN** protocol message id validation rejects secret-bearing metadata
- **THEN** the rejection MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect peers, suppress host visibility, sync clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows
