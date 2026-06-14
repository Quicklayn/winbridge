# relay-heartbeat Specification

## Purpose
Defines development relay liveness checks, stale peer timeout behavior, and secret-safe heartbeat timeout audit requirements.
## Requirements
### Requirement: Configurable relay heartbeat
The relay SHALL support development heartbeat configuration for WebSocket peer liveness checks with safe default interval and timeout values, and SHALL reject malformed or unsafe heartbeat enabled flag, interval, or timeout configuration before accepting peers. Injected heartbeat timer configuration accepted by the relay SHALL be copied into a validated internal snapshot before use, so caller-owned object mutation after validation cannot change heartbeat interval or timeout behavior.

#### Scenario: Heartbeat environment omitted
- **WHEN** the relay starts without heartbeat environment variables
- **THEN** the relay uses development heartbeat defaults and enables liveness checks

#### Scenario: Heartbeat enabled flag is canonical
- **WHEN** the relay starts with `WINBRIDGE_RELAY_HEARTBEAT_ENABLED` set to `true`, `false`, `yes`, `no`, `1`, or `0`
- **THEN** the relay accepts the flag value and applies the matching heartbeat enabled state

#### Scenario: Heartbeat enabled flag is malformed
- **WHEN** the relay is configured with an empty, whitespace-only, untrimmed, case-variant, or unknown `WINBRIDGE_RELAY_HEARTBEAT_ENABLED` value
- **THEN** the relay rejects configuration before accepting peer connections or scheduling heartbeat timers

#### Scenario: Heartbeat disabled for a test runtime
- **WHEN** a test creates a managed relay runtime with heartbeat disabled
- **THEN** the relay does not create peer heartbeat timers for that runtime

#### Scenario: Heartbeat timer environment is malformed
- **WHEN** the relay is configured with empty, partial, fractional, negative, zero, or timer-unsafe heartbeat interval or timeout environment values
- **THEN** the relay rejects configuration before accepting peer connections or scheduling heartbeat timers

#### Scenario: Injected heartbeat config is mutated after validation
- **WHEN** caller code mutates an injected heartbeat configuration object after relay heartbeat validation
- **THEN** the relay continues using the validated interval and timeout snapshot
- **AND** the mutation MUST NOT create unsafe timers, approve sessions, grant permissions, start capture, send input, suppress host visibility, or bypass consent workflows

### Requirement: Stale peer timeout
The relay SHALL close an accepted WebSocket peer that does not respond to a relay heartbeat within the configured timeout, and SHALL classify the resulting broker-observed disconnect with bounded reason code `heartbeat-timeout`.

#### Scenario: Peer misses heartbeat response
- **WHEN** an accepted peer is awaiting a heartbeat response beyond the configured timeout
- **THEN** the relay terminates that peer connection and removes the peer from relay room membership through the normal close cleanup

#### Scenario: Heartbeat timeout uses bounded disconnect reason
- **WHEN** the relay terminates a registered peer because the peer missed heartbeat response
- **THEN** any `peer-disconnected` notice and disconnect audit emitted during cleanup use reason code `heartbeat-timeout`
- **AND** the reason code MUST NOT include raw close reasons, tokens, pairing codes, protocol payloads, credentials, keystrokes, screenshots, screen contents, or full secrets

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

### Requirement: Heartbeat safety boundary
Relay heartbeat checks MUST NOT grant permissions, approve sessions, start capture, send input, suppress host visibility, or bypass consent workflows.

#### Scenario: Heartbeat runs during an unapproved session attempt
- **WHEN** heartbeat checks run for a relay peer that has not completed an authorized remote assistance workflow
- **THEN** heartbeat only verifies transport liveness and does not change authorization, consent, visibility, capture, or input state
