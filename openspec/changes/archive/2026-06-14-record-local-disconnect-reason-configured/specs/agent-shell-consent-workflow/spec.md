## MODIFIED Requirements

### Requirement: Host workflow audit file persistence
The host shell SHALL persist local development audit records for host-generated workflow `audit-event` messages and host-local disconnect controls when an audit sink is configured. When an audit sink is configured, the host shell MUST successfully write the matching local audit record before sending the associated host authorization decision, authorization state, permission revoke, session control, or protocol `audit-event` message for that audited workflow action. Local host disconnect audit failures MUST be surfaced through sanitized runtime diagnostics but MUST NOT prevent host indicator deactivation or local WebSocket close.

#### Scenario: Host approval audit is persisted
- **WHEN** the host shell is configured with an audit sink and explicitly approves a visible authorization request
- **THEN** it writes schema-valid audit records for approval and visible activation using the host actor, session id, action, outcome, and secret-safe detail metadata

#### Scenario: Host denial audit is persisted
- **WHEN** the host shell is configured with an audit sink and explicitly denies an authorization request
- **THEN** it writes a schema-valid denied audit record without raw denial reason text

#### Scenario: Host lifecycle audit is persisted
- **WHEN** the host shell emits delayed or direct revocation, pause, resume, termination, or expiration workflow audit-events
- **THEN** it writes matching schema-valid audit records with the same event ids, actions, outcomes, and secret-safe details

#### Scenario: Host local disconnect audit is persisted
- **WHEN** the host shell closes a visible active or paused session through local disconnect simulation or direct local disconnect control
- **THEN** it writes a schema-valid `agent-shell.session.disconnected` audit record with accepted outcome, host actor, session id, cause `local-disconnect`, visible flag, permission count, and bounded `reasonConfigured` boolean metadata

#### Scenario: Agent shell audit file details are secret-safe
- **WHEN** host workflow audit records are persisted with private host display-name, viewer display-name, lifecycle-reason, pairing-code, signal-payload, close-reason, or protocol-payload marker values present elsewhere in the workflow
- **THEN** persisted records MUST NOT include those raw values

#### Scenario: Received protocol payloads are not persisted as workflow audit
- **WHEN** the host shell receives protocol or non-protocol messages during a session
- **THEN** it does not persist those raw payloads through the host workflow audit sink

#### Scenario: Audit write failures are surfaced
- **WHEN** the configured host workflow audit sink fails to write a record
- **THEN** the host shell surfaces the failure instead of silently dropping the audit record

#### Scenario: Denial is not sent when denial audit persistence fails
- **WHEN** the host shell is configured with an audit sink, explicitly denies an authorization request, and the matching audit write fails
- **THEN** it MUST surface the sanitized runtime failure before sending the denial decision or denial audit-event

#### Scenario: Lifecycle update is not sent when lifecycle audit persistence fails
- **WHEN** the host shell is configured with an audit sink and a delayed or direct revocation, pause, resume, termination, or expiration audit write fails
- **THEN** it MUST surface the sanitized runtime failure before sending the associated permission revoke, session control, authorization state, or lifecycle audit-event message

#### Scenario: Local disconnect proceeds when disconnect audit persistence fails
- **WHEN** the host shell is configured with an audit sink and a local disconnect audit write fails
- **THEN** it MUST surface a sanitized runtime failure
- **AND** it MUST still emit an inactive local host indicator and close the local WebSocket without sending peer-originated `peer-disconnected`

### Requirement: Host disconnect reason remains local metadata
The host disconnect reason SHALL be used only as the local host WebSocket close reason for host-local disconnect. Raw host disconnect reason text MUST NOT be sent as a protocol message, persisted in host workflow audit records, logged as raw text, exposed in local runtime event payloads, grant permissions, start capture, send input, reconnect peers, suppress host visibility, or bypass consent workflows. Host workflow audit records MAY persist only bounded boolean metadata that a host disconnect reason was configured.

#### Scenario: Disconnect close diagnostics redact reason text
- **WHEN** host disconnect simulation or direct host disconnect control closes the local host WebSocket with a configured disconnect reason
- **THEN** local closed events expose redacted close reason text and safe byte length only
- **AND** logs and local runtime events MUST NOT contain the raw configured disconnect reason

#### Scenario: Disconnect audit remains reason-free
- **WHEN** the host shell persists an `agent-shell.session.disconnected` audit record after local host disconnect with a configured disconnect reason
- **THEN** the audit record contains bounded lifecycle metadata such as authorization id/status, cause, visible flag, permission count, and `reasonConfigured: true`
- **AND** it MUST NOT contain the raw configured disconnect reason
