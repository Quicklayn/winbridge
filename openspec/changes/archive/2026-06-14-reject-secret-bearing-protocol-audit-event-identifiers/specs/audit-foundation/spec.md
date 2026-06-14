## ADDED Requirements

### Requirement: Protocol audit-event fixed identifiers reject secret-bearing metadata
The protocol schema SHALL reject `audit-event` envelopes whose fixed identifiers contain secret-bearing protocol identifier metadata before parsing, encoding, forwarding, local emission, local storage, file persistence, or development component storage. Fixed protocol audit-event identifiers MUST include `messageId`, `sessionId`, `eventId`, and `actorPeerId`. Secret-bearing metadata MUST include raw token, credential, password, passphrase, secret, pairing-code, API-key, access-key, cookie, private-key, SSH-key, authorization, authorization-header, auth-header, or proxy-authorization marker families. Rejection diagnostics MUST NOT expose the raw rejected identifier value.

#### Scenario: Audit-event message id contains secret-bearing metadata
- **WHEN** a protocol `audit-event` envelope is parsed or encoded with a `messageId` containing secret-bearing protocol identifier metadata
- **THEN** the protocol schema rejects the message before forwarding, emission, encoding, persistence, or storage
- **AND** the rejection MUST NOT expose the raw `messageId`

#### Scenario: Audit-event session id contains secret-bearing metadata
- **WHEN** a protocol `audit-event` envelope is parsed or encoded with a `sessionId` containing secret-bearing protocol identifier metadata
- **THEN** the protocol schema rejects the message before forwarding, emission, encoding, persistence, or storage
- **AND** the rejection MUST NOT expose the raw `sessionId`

#### Scenario: Audit-event event id contains secret-bearing metadata
- **WHEN** a protocol `audit-event` envelope is parsed or encoded with an `eventId` containing secret-bearing protocol identifier metadata
- **THEN** the protocol schema rejects the message before forwarding, emission, encoding, persistence, or storage
- **AND** the rejection MUST NOT expose the raw `eventId`

#### Scenario: Audit-event actor peer id contains secret-bearing metadata
- **WHEN** a protocol `audit-event` envelope is parsed or encoded with an `actorPeerId` containing secret-bearing protocol identifier metadata
- **THEN** the protocol schema rejects the message before forwarding, emission, encoding, persistence, or storage
- **AND** the rejection MUST NOT expose the raw `actorPeerId`

#### Scenario: Safe audit-event identifiers remain accepted
- **WHEN** a protocol `audit-event` envelope uses schema-valid non-secret `messageId`, `sessionId`, `eventId`, and `actorPeerId`
- **THEN** the protocol schema accepts those identifiers when all other audit-event fields are valid

#### Scenario: Audit-event identifier rejection preserves detail redaction
- **WHEN** a protocol `audit-event` envelope uses safe fixed identifiers and detail metadata containing sensitive fields
- **THEN** the protocol schema continues to redact audit-event detail metadata before returning or encoding the message

#### Scenario: Protocol audit-event identifier rejection remains non-authorizing
- **WHEN** the protocol schema rejects an `audit-event` fixed identifier containing secret-bearing metadata
- **THEN** the rejection MUST NOT grant permissions, approve authorization, activate host visibility, start capture, send input, reconnect peers, suppress host visibility, sync clipboard, transfer files, expose diagnostics, install services, configure startup persistence, collect credentials, hide the session from the host, or bypass consent workflows
