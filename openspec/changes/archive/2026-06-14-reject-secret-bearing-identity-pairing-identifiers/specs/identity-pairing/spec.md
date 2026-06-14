## ADDED Requirements

### Requirement: Identity and pairing identifiers reject secret-bearing metadata
The identity layer SHALL reject device identity and pairing record identifiers whose values contain secret-bearing protocol identifier metadata before treating those records as trusted identity, pairing, relay room, or audit metadata. Secret-bearing identity and pairing identifiers MUST include raw token, credential, password, passphrase, secret, pairing-code, API-key, access-key, cookie, private-key, SSH-key, authorization, authorization-header, auth-header, or proxy-authorization marker families. Rejection diagnostics MUST remain bounded and MUST NOT expose the raw rejected identifier.

#### Scenario: Device identity id contains secret-bearing metadata
- **WHEN** a peer sends or constructs device identity metadata whose `deviceId` contains a secret-bearing marker family
- **THEN** identity validation rejects the metadata before returning trusted identity data, registering a relay peer, creating pairing material, or writing accepted join audit
- **AND** diagnostics MUST NOT expose the raw `deviceId`

#### Scenario: Pairing ticket identifier contains secret-bearing metadata
- **WHEN** code creates or parses pairing ticket metadata whose `pairingId`, `sessionId`, or `hostDeviceId` contains a secret-bearing marker family
- **THEN** pairing validation rejects the ticket before returning trusted ticket data, storing pairing material, consuming pairing material, or authorizing relay room access
- **AND** diagnostics MUST NOT expose the raw rejected identifier

#### Scenario: Paired-device identifier contains secret-bearing metadata
- **WHEN** code creates or parses paired-device metadata whose `pairingId`, `sessionId`, `hostDeviceId`, or `viewerDeviceId` contains a secret-bearing marker family
- **THEN** pairing validation rejects the paired-device record before returning trusted paired metadata, recording a paired device, or authorizing relay room access
- **AND** diagnostics MUST NOT expose the raw rejected identifier

#### Scenario: Relay rejects secret-bearing join device id before pairing side effects
- **WHEN** an unregistered peer sends a join message whose device identity `deviceId` contains secret-bearing metadata
- **THEN** the relay rejects the message before peer registration, host pairing ticket creation, viewer pairing ticket consumption, accepted join audit, or join-denial audit
- **AND** peer-facing relay errors and invalid-message audit records MUST NOT expose the raw `deviceId`

#### Scenario: Relay rejects secret-bearing join ids before pairing side effects
- **WHEN** an unregistered peer sends a join message whose `sessionId` contains secret-bearing metadata or whose `peerId` would derive a secret-bearing fallback device id
- **THEN** the relay rejects the message before peer registration, host pairing ticket creation, viewer pairing ticket consumption, paired-device recording, accepted join audit, or join-denial audit
- **AND** peer-facing relay errors and invalid-message audit records MUST NOT expose the raw `sessionId`, raw `peerId`, raw derived device id, or raw pairing code

#### Scenario: Safe identity and pairing identifiers remain accepted
- **WHEN** device identity and pairing records use schema-valid non-secret development ids or UUID-derived ids
- **THEN** identity and pairing validation accepts those identifiers when all other metadata requirements pass

#### Scenario: Identity and pairing identifier rejection remains non-authorizing
- **WHEN** identity or pairing identifier validation rejects secret-bearing metadata
- **THEN** the rejection MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect peers, suppress host visibility, sync clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows
