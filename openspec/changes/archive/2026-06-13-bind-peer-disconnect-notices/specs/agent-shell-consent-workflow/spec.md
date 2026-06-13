## MODIFIED Requirements

### Requirement: Peer disconnect state handling
The agent shell SHALL treat a received `peer-disconnected` message as remote peer disconnected state only when the notice identifies the already observed opposite-role peer for the current development session. After recording this trusted state, the managed runtime MUST fail closed for delayed workflow sends and direct public runtime sends to that disconnected peer. The runtime MUST ignore unbound, same-role, or mismatched `peer-disconnected` notices before local `received` protocol event emission, before recording remote peer disconnected state, and before deactivating the host indicator.

#### Scenario: Viewer receives host disconnect notice
- **WHEN** the host peer disconnects while a viewer shell remains connected through the relay after observing that host as the opposite-role peer
- **THEN** the viewer shell receives and records the `peer-disconnected` protocol message without starting capture, sending input, reconnecting, or granting permissions

#### Scenario: Host suppresses delayed workflow after viewer disconnect
- **WHEN** the host shell has delayed workflow simulation scheduled and receives `peer-disconnected` for the observed viewer
- **THEN** the host shell MUST NOT send later revoke, pause, resume, termination, expiration, authorization state, session control, permission revoke, or workflow audit-event messages for that disconnected peer

#### Scenario: Direct runtime send is blocked after peer disconnect
- **WHEN** the agent shell records remote peer disconnected state for the observed opposite-role peer
- **AND** caller code invokes the public managed runtime `send()` method
- **THEN** the send MUST fail before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked message

#### Scenario: Unbound disconnect notice is ignored
- **WHEN** an agent shell receives a decoded `peer-disconnected` notice before it has observed an opposite-role peer identity
- **THEN** the shell MUST ignore the notice before local `received` protocol event emission
- **AND** the notice MUST NOT record remote peer disconnected state, suppress delayed host workflow, deactivate the host indicator, approve authorization, grant permissions, start capture, send input, reconnect a peer, suppress host visibility, or bypass consent workflows

#### Scenario: Mismatched disconnect notice is ignored
- **WHEN** an agent shell has observed one opposite-role peer and later receives a decoded `peer-disconnected` notice for a different peer id or role
- **THEN** the shell MUST ignore the notice before local `received` protocol event emission
- **AND** the mismatched notice MUST NOT record remote peer disconnected state, suppress delayed host workflow, deactivate the host indicator, approve authorization, grant permissions, start capture, send input, reconnect a peer, suppress host visibility, or bypass consent workflows

#### Scenario: Disconnect summary logging is secret-safe
- **WHEN** the agent shell logs a received trusted peer disconnect notice
- **THEN** the log MAY include peer id, peer role, message id, and bounded reason code, and MUST NOT include raw tokens, raw pairing codes, credentials, raw protocol payloads, keystrokes, screenshots, screen contents, or full secrets

#### Scenario: Ignored disconnect diagnostics are secret-safe
- **WHEN** the shell ignores an unbound, same-role, self, or mismatched decoded `peer-disconnected` notice
- **THEN** local events and logs expose only redacted summary metadata such as byte length
- **AND** they MUST NOT expose raw protocol payloads, session ids, peer ids, roles, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, or input contents

#### Scenario: Disconnect state is not authorization
- **WHEN** the agent shell records trusted remote peer disconnect state
- **THEN** the state MUST NOT approve authorization, activate a visible session, grant permissions, start capture, send input, reconnect the peer, suppress host visibility, or bypass consent workflows
