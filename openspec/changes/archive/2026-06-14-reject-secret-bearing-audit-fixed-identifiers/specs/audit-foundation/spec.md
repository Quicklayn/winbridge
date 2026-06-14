## ADDED Requirements

### Requirement: Audit fixed identifiers reject secret-bearing metadata
The audit layer SHALL reject fixed audit identifier fields that contain secret-bearing protocol identifier metadata before local storage, local emission, console output, file persistence, protocol encoding, forwarding, or development component storage. Fixed audit identifier fields MUST include `eventId`, `actor.id`, `sessionId`, and `target.id`. Secret-bearing metadata MUST include raw token, credential, password, passphrase, secret, pairing-code, API-key, access-key, cookie, private-key, SSH-key, authorization, authorization-header, auth-header, or proxy-authorization marker families. Rejection diagnostics MUST NOT expose the raw rejected identifier value.

#### Scenario: Event id contains secret-bearing metadata
- **WHEN** a component creates an audit record whose `eventId` contains secret-bearing protocol identifier metadata
- **THEN** audit validation rejects the record before storage or emission
- **AND** the rejection MUST NOT expose the raw `eventId`

#### Scenario: Actor id contains secret-bearing metadata
- **WHEN** a component creates an audit record whose `actor.id` contains secret-bearing protocol identifier metadata
- **THEN** audit validation rejects the record before storage or emission
- **AND** the rejection MUST NOT expose the raw `actor.id`

#### Scenario: Session id contains secret-bearing metadata
- **WHEN** a component creates an audit record whose top-level `sessionId` contains secret-bearing protocol identifier metadata
- **THEN** audit validation rejects the record before storage or emission
- **AND** the rejection MUST NOT expose the raw `sessionId`

#### Scenario: Target id contains secret-bearing metadata
- **WHEN** a component creates an audit record whose `target.id` contains secret-bearing protocol identifier metadata
- **THEN** audit validation rejects the record before storage or emission
- **AND** the rejection MUST NOT expose the raw `target.id`

#### Scenario: Safe fixed audit identifiers remain accepted
- **WHEN** a component creates an audit record with schema-valid non-secret `eventId`, `actor.id`, `sessionId`, and `target.id`
- **THEN** audit validation accepts those fixed identifiers when all other audit fields are valid

#### Scenario: Fixed identifier rejection remains non-authorizing
- **WHEN** audit validation rejects a fixed identifier containing secret-bearing metadata
- **THEN** the rejection MUST NOT grant permissions, approve authorization, activate host visibility, start capture, send input, reconnect peers, suppress host visibility, sync clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows
