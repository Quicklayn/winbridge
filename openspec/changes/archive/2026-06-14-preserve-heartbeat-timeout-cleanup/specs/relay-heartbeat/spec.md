## MODIFIED Requirements

### Requirement: Heartbeat timeout audit
The relay SHALL emit a secret-safe audit event when a peer is terminated because of heartbeat timeout. Heartbeat timeout audit persistence MUST be post-decision observability: if writing the timeout audit record fails, the relay MUST still terminate the timed-out peer and allow normal close cleanup, bounded peer disconnect notification, and bounded disconnect audit behavior to proceed. Diagnostics for heartbeat timeout audit failure MUST remain bounded and MUST NOT expose raw audit sink error text, raw logger error text, raw close reasons, pairing codes, tokens, protocol payloads, display names, private reasons, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, diagnostics content/dumps, or full secrets.

#### Scenario: Heartbeat timeout is audited
- **WHEN** the relay terminates a peer because the peer missed heartbeat response
- **THEN** the audit event records failed outcome, relay actor, peer role when known, session identifier when known, and heartbeat timing metadata
- **AND** the audit event MUST NOT include raw shared tokens, pairing codes, protocol payloads, credentials, or Windows secrets

#### Scenario: Heartbeat timeout audit failure does not prevent cleanup
- **WHEN** a registered peer misses heartbeat response beyond the configured timeout
- **AND** writing the `relay.peer.heartbeat.timeout` audit record fails
- **THEN** the relay still terminates the timed-out peer connection and removes the peer from relay room membership through normal close cleanup
- **AND** remaining peers still receive bounded `peer-disconnected` notices with reason code `heartbeat-timeout`
- **AND** diagnostics about the timeout audit failure remain bounded and secret-safe

#### Scenario: Heartbeat timeout audit warning failure is contained
- **WHEN** writing the `relay.peer.heartbeat.timeout` audit record fails
- **AND** the diagnostic logger also fails while reporting the bounded warning
- **THEN** the relay MUST NOT let the logger failure escape the heartbeat timeout path
- **AND** timeout termination and normal close cleanup still proceed
- **AND** the logger failure MUST NOT grant permissions, start capture, send input, reconnect peers, suppress host visibility, hide the session from the host, or bypass consent workflows
