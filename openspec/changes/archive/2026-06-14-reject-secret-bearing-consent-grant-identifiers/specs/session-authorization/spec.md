## ADDED Requirements

### Requirement: Consent-bound grant identifiers reject secret-bearing metadata
The shared consent-bound session grant schema SHALL reject fixed grant identifiers that contain secret-bearing protocol identifier metadata before returning a grant snapshot or authorizing a sensitive action. Fixed consent-bound grant identifiers MUST include `sessionId`, `hostPeerId`, `viewerPeerId`, and `auditId`. Secret-bearing metadata MUST include raw token, credential, password, passphrase, secret, pairing-code, API-key, access-key, cookie, private-key, SSH-key, authorization, authorization-header, auth-header, or proxy-authorization marker families. Rejection diagnostics MUST NOT expose the raw rejected identifier value.

#### Scenario: Grant session id contains secret-bearing metadata
- **WHEN** a consent-bound session grant is validated with a `sessionId` containing secret-bearing protocol identifier metadata
- **THEN** schema validation rejects the grant before returning a grant snapshot
- **AND** the rejection MUST NOT expose the raw `sessionId`

#### Scenario: Grant host peer id contains secret-bearing metadata
- **WHEN** a consent-bound session grant is validated with a `hostPeerId` containing secret-bearing protocol identifier metadata
- **THEN** schema validation rejects the grant before returning a grant snapshot
- **AND** the rejection MUST NOT expose the raw `hostPeerId`

#### Scenario: Grant viewer peer id contains secret-bearing metadata
- **WHEN** a consent-bound session grant is validated with a `viewerPeerId` containing secret-bearing protocol identifier metadata
- **THEN** schema validation rejects the grant before returning a grant snapshot
- **AND** the rejection MUST NOT expose the raw `viewerPeerId`

#### Scenario: Grant audit id contains secret-bearing metadata
- **WHEN** a consent-bound session grant is validated with an `auditId` containing secret-bearing protocol identifier metadata
- **THEN** schema validation rejects the grant before returning a grant snapshot
- **AND** the rejection MUST NOT expose the raw `auditId`

#### Scenario: Secret-bearing grant identifier fails action authorization
- **WHEN** a sensitive remote action authorization check receives a grant whose fixed identifier contains secret-bearing protocol identifier metadata
- **THEN** the authorization check rejects the grant before authorizing the action
- **AND** the rejection MUST NOT expose the raw rejected identifier

#### Scenario: Safe grant identifiers remain accepted
- **WHEN** a consent-bound session grant uses schema-valid non-secret `sessionId`, `hostPeerId`, `viewerPeerId`, and `auditId`
- **THEN** schema validation accepts those identifiers when all other consent, visibility, expiration, and permission-scope requirements are valid

#### Scenario: Grant identifier rejection preserves fail-closed behavior
- **WHEN** grant identifier validation rejects secret-bearing metadata
- **THEN** the rejection MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect peers, suppress host visibility, sync clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows
