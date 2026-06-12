## ADDED Requirements

### Requirement: Canonical protocol workflow reasons
The protocol SHALL reject workflow `reason` metadata in authorization decisions, authorization state updates, permission revocation messages, and session-control messages when the reason is blank, oversized, or not already trimmed. Rejection MUST occur before forwarding, encoding, local trusted event emission, or workflow handling, and MUST NOT grant permissions, activate host visibility, start capture, send input, reconnect peers, or bypass consent workflows.

#### Scenario: Protocol workflow reason is untrimmed
- **WHEN** a peer sends or encodes an authorization lifecycle or session-control protocol message with a workflow `reason` that has leading or trailing whitespace
- **THEN** schema validation MUST reject the message before it is forwarded, encoded, or treated as trusted workflow metadata

#### Scenario: Protocol workflow reason rejection is non-authorizing
- **WHEN** workflow reason validation rejects a malformed protocol message
- **THEN** the rejection MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect a peer, suppress visibility, or bypass consent workflows
