## ADDED Requirements

### Requirement: Agent shell sends consent-bound remote interaction messages

The agent shell SHALL expose explicit non-native development runtime operations for sending `screen-frame` from host runtimes and `input-event` from viewer runtimes. Each operation MUST validate the message, role, session id, local peer id, observed recipient peer id, authorization id, active visible unexpired authorization status, and required permission immediately before writing to the socket.

#### Scenario: Host sends authorized development screen frame
- **WHEN** a host runtime has an active visible unexpired authorization that grants `screen:view`
- **AND** the host invokes the development screen-frame send operation with the current authorization id and a schema-valid frame
- **THEN** the runtime writes a metadata-only accepted local audit record before sending the `screen-frame` to the relay
- **AND** local sent events and logs MUST NOT expose raw frame bytes, encoded frame data, screenshots, screen contents, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Viewer sends authorized development pointer input
- **WHEN** a viewer runtime has an active visible unexpired authorization that grants `input:pointer`
- **AND** the viewer invokes the development input-event send operation with the current authorization id and a schema-valid pointer event
- **THEN** the runtime writes a metadata-only accepted local audit record before sending the `input-event` to the relay
- **AND** local sent events and logs MUST NOT expose pointer coordinates, button values, raw input payloads, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Viewer sends authorized development keyboard input
- **WHEN** a viewer runtime has an active visible unexpired authorization that grants `input:keyboard`
- **AND** the viewer invokes the development input-event send operation with the current authorization id and a schema-valid keyboard event
- **THEN** the runtime writes a metadata-only accepted local audit record before sending the `input-event` to the relay
- **AND** local sent events and logs MUST NOT expose key values, modifier values, raw input payloads, credentials, tokens, pairing codes, private reasons, keystroke buffers, or full secrets

#### Scenario: Local remote interaction send lacks authorization
- **WHEN** a host or viewer invokes a remote interaction send operation without active visible unexpired authorization for the required permission and matching authorization id
- **THEN** the runtime rejects the operation before audit acceptance, socket write, local sent event emission, rendering, capture side effects, input side effects, native adapter calls, reconnection, hidden session behavior, or consent bypass

#### Scenario: Local remote interaction audit fails
- **WHEN** a runtime is otherwise authorized to send a remote interaction message but accepted local audit persistence fails
- **THEN** the runtime rejects the operation before writing the message to the socket
- **AND** diagnostics MUST remain bounded and MUST NOT expose raw frame bytes, screen contents, pointer data, key data, modifier data, credentials, tokens, pairing codes, private reasons, or full secrets

### Requirement: Agent shell accepts inbound remote interaction messages only after matching authorization

The agent shell SHALL process inbound `screen-frame` and `input-event` envelopes as non-native development observations only when the sender role, sender peer id, session id, target peer id, authorization id, visible active unexpired authorization state, and required permission match the local runtime state. Inbound acceptance MUST NOT render frames, capture the screen, inject OS input, reconnect peers, suppress host visibility, install services, configure startup persistence, elevate privileges, hide sessions, collect credentials, or bypass Windows prompts.

#### Scenario: Viewer accepts authorized development screen frame
- **WHEN** a viewer runtime receives a `screen-frame` from the observed host for the active visible unexpired authorization that grants `screen:view`
- **THEN** the runtime emits only a redacted received event summary for the frame
- **AND** local events and logs MUST NOT expose raw frame bytes, encoded frame data, screenshots, screen contents, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Host accepts authorized development input event
- **WHEN** a host runtime receives an `input-event` from the observed viewer for the active visible unexpired authorization that grants the matching input permission
- **THEN** the runtime emits only a redacted received event summary for the input intent
- **AND** local events and logs MUST NOT expose pointer coordinates, button values, key values, modifier values, raw input payloads, credentials, tokens, pairing codes, private reasons, keystroke buffers, or full secrets

#### Scenario: Inbound remote interaction is stale after pause or revoke
- **WHEN** a runtime receives a schema-valid remote interaction envelope after the relevant authorization is paused, revoked, terminated, expired, missing, invisible, or missing the required permission
- **THEN** the runtime rejects or ignores the envelope before trusted received event emission, rendering, capture side effects, input side effects, native adapter calls, reconnection, hidden session behavior, or consent bypass

#### Scenario: Inbound remote interaction is misbound
- **WHEN** a runtime receives a remote interaction envelope whose session id, sender peer id, target peer id, local role direction, or authorization id does not match the current observed peer and authorization
- **THEN** the runtime rejects or ignores the envelope before trusted received event emission, rendering, capture side effects, input side effects, native adapter calls, reconnection, hidden session behavior, or consent bypass

### Requirement: Agent shell remote interaction diagnostics remain metadata-only

The agent shell SHALL redact remote interaction data in public runtime events, diagnostic logs, thrown errors, local audit details, and raw-event summaries. Metadata-only summaries MAY include message type, message id, authorization id, frame id or event id, sequence, format, dimensions, payload byte length, input kind, and permission count, but MUST NOT include raw frame data, screen contents, pointer coordinates, button values, key values, modifier values, keylogging buffers, clipboard contents, file contents, diagnostics dumps, credentials, tokens, pairing codes, private reasons, or full secrets.

#### Scenario: Remote interaction sent event is redacted
- **WHEN** a runtime emits a local `sent` event for a `screen-frame` or `input-event`
- **THEN** the event contains only metadata-safe summary fields for the remote interaction payload
- **AND** it MUST NOT expose raw frame bytes, encoded frame data, pointer coordinates, button values, key values, modifier values, raw input payloads, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Remote interaction rejection diagnostics are redacted
- **WHEN** a runtime rejects a malformed, unauthorized, misrouted, stale, or audit-blocked remote interaction send or inbound message
- **THEN** thrown errors, runtime events, and logs remain bounded and metadata-only
- **AND** they MUST NOT expose raw frame bytes, encoded frame data, screen contents, pointer coordinates, button values, key values, modifier values, raw input payloads, credentials, tokens, pairing codes, private reasons, or full secrets
