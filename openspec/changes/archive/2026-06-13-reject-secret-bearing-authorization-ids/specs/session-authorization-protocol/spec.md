## ADDED Requirements

### Requirement: Protocol authorization identifiers are non-secret metadata
The protocol SHALL reject authorization lifecycle and control envelopes whose `authorizationId` contains secret-bearing metadata such as token, credential, cookie, API key, access key, private key, SSH key, authorization header, or auth header markers. Rejection MUST occur before forwarding, trusted runtime event emission, workflow processing, or treating the message as authorization state.

#### Scenario: Authorization decision id contains secret marker
- **WHEN** a `session-authorization-decision` message contains a secret-bearing `authorizationId`
- **THEN** the protocol schema rejects the message before forwarding or processing it
- **AND** the rejection MUST NOT approve authorization, activate host visibility, grant permissions, start capture, send input, reconnect a peer, or bypass consent workflows

#### Scenario: Authorization state id contains secret marker
- **WHEN** a `session-authorization-state` message contains a secret-bearing `authorizationId`
- **THEN** the protocol schema rejects the message before peers can treat it as authorization state

#### Scenario: Permission revoke id contains secret marker
- **WHEN** a `permission-revoked` message contains a secret-bearing `authorizationId`
- **THEN** the protocol schema rejects the message before peers can treat it as a grant change

#### Scenario: Session control id contains secret marker
- **WHEN** a `session-control` message contains a secret-bearing `authorizationId`
- **THEN** the protocol schema rejects the message before peers can process pause, resume, terminate, or permission-revocation intent

#### Scenario: Safe protocol authorization id remains valid
- **WHEN** an authorization lifecycle or control envelope uses a schema-valid non-secret `authorizationId`
- **THEN** the protocol schema accepts that identifier if all other message requirements pass
