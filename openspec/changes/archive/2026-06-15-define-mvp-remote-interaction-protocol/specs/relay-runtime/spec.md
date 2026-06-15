## ADDED Requirements

### Requirement: Remote interaction relay forwarding policy

The relay runtime SHALL forward schema-valid MVP remote interaction envelopes only when the registered sender role, sender peer id, recipient role, and optional target peer id match the two-party remote-assistance room. `screen-frame` messages MUST originate from the registered host and target the registered viewer. `input-event` messages MUST originate from the registered viewer and target the registered host.

#### Scenario: Relay forwards host screen frame to viewer
- **WHEN** a registered host sends a schema-valid `screen-frame` with matching `fromPeerId` and optional `toPeerId` targeting the registered viewer
- **THEN** the relay forwards the message to the viewer after accepted-forward audit succeeds
- **AND** the accepted-forward audit detail includes the non-secret `authorizationId`
- **AND** relay audit details MUST NOT include raw frame bytes or encoded frame data

#### Scenario: Relay forwards viewer input event to host
- **WHEN** a registered viewer sends a schema-valid `input-event` with matching `fromPeerId` and optional `toPeerId` targeting the registered host
- **THEN** the relay forwards the message to the host after accepted-forward audit succeeds
- **AND** the accepted-forward audit detail includes the non-secret `authorizationId`
- **AND** relay audit details MUST NOT include key values, modifier values, pointer coordinates, button values, or raw input event payloads

#### Scenario: Relay rejects wrong-role remote interaction
- **WHEN** a registered viewer sends `screen-frame` or a registered host sends `input-event`
- **THEN** the relay returns a bounded relay error to the sender and does not forward the message to the remaining peer
- **AND** rejection audit metadata MUST NOT include raw frame bytes, encoded frame data, key values, modifier values, pointer coordinates, button values, or raw input event payloads

#### Scenario: Relay rejects misaddressed remote interaction
- **WHEN** a registered peer sends `screen-frame` or `input-event` with `toPeerId` set to itself or an unknown peer
- **THEN** the relay returns a bounded relay error to the sender and does not forward the message to the remaining peer
- **AND** rejection audit metadata MUST remain bounded and secret-safe

#### Scenario: Relay forwarding remains non-authorizing
- **WHEN** the relay forwards a schema-valid `screen-frame` or `input-event`
- **THEN** relay forwarding MUST NOT approve authorization, activate host visibility, grant permissions, start capture, apply input, reconnect peers, suppress host visibility, install services, configure startup persistence, collect credentials, elevate privileges, hide the session, or bypass Windows prompts
