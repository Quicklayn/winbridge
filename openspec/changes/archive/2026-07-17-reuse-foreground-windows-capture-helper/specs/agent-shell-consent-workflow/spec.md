## ADDED Requirements

### Requirement: Agent shell binds Windows capture helper lifetime to host authorization

A host agent runtime that performs native screen capture SHALL own at most one
reusable Windows capture adapter for its current foreground runtime. The
runtime MUST keep capture locally blocked until active visible unexpired
authorization grants `screen:view`, and MUST close the adapter when the host
pauses, revokes any permission, terminates or expires, either peer disconnects,
the socket closes, the runtime stops, or connection-scoped authorization is
replaced. Adapter close failure MUST NOT delay or suppress the host lifecycle
action or visible indicator transition.

The runtime MUST require a configured audit sink and persist metadata-only
capture-request audit before creating or invoking the adapter. After adapter
success, it MUST revalidate the current routing, authorization id, active
visible unexpired state, `screen:view` permission, local capture block, and peer
connectivity before persisting trusted capture-completed evidence, sending a
screen frame, or emitting trusted sent-event evidence. An injected capture
adapter MUST expose an effective synchronous close boundary.

#### Scenario: Active host runtime reuses its capture adapter

- **WHEN** a host performs multiple audited native captures during one active
  visible `screen:view` authorization
- **THEN** it routes them through the same runtime-owned adapter instance while
  retaining metadata-only capture-request audit before every adapter call
- **AND** it writes capture-completed evidence and sends each frame only after
  adapter success and post-success authorization revalidation

#### Scenario: Failed active indicator keeps native capture blocked

- **WHEN** active authorization state is prepared but the visible host
  indicator callback fails before activation completes
- **THEN** native capture remains locally blocked and no adapter or helper may
  be created or invoked under that incomplete activation

#### Scenario: Missing audit sink blocks native capture

- **WHEN** host runtime code requests native capture without a configured local
  audit sink or capture-request audit persistence fails
- **THEN** it rejects before creating or invoking the adapter, starting a
  helper, capturing screen content, writing completion evidence, or sending a
  frame

#### Scenario: Pause closes pending native capture

- **WHEN** the host pauses while native capture is active or queued
- **THEN** the runtime locally blocks capture and attempts adapter close before
  later screen data can be trusted or sent
- **AND** late adapter success MUST NOT create trusted completion evidence,
  screen-frame sends, or trusted sent events

#### Scenario: Permission revoke or terminal lifecycle closes pending capture

- **WHEN** the host revokes any permission, terminates, expires, disconnects, or
  loses the viewer while native capture is active or queued
- **THEN** the runtime attempts adapter close and no queued or late capture may
  produce trusted completion or frame-send evidence after that boundary
- **AND** a successful partial revoke may re-enable later capture only when the
  resulting active visible authorization still grants `screen:view`

#### Scenario: Runtime stop and socket close release the capture helper

- **WHEN** a host runtime stops or its relay socket closes
- **THEN** it blocks capture and attempts adapter close without starting a
  replacement helper, reconnecting peers, delaying shutdown, or exposing native
  diagnostics
- **AND** runtime stop attempts capture close before deactivating the visible
  host indicator

#### Scenario: Resume requires fresh screen validation

- **WHEN** the host resumes after pause and later requests another native frame
- **THEN** the request must pass ordinary routing, active visible unexpired
  authorization, connectivity, `screen:view`, and audit gates before a fresh
  helper generation may start

#### Scenario: Lifecycle audit failure keeps native capture blocked

- **WHEN** pause, permission revoke, terminate, expiration, or disconnect
  begins and its lifecycle audit persistence fails before protocol state can be
  updated
- **THEN** the runtime keeps native capture locally blocked and does not invoke
  the adapter under the stale authorization view
- **AND** adapter close or audit diagnostics MUST NOT expose frame data, screen
  contents, identifiers, paths, tokens, pairing codes, credentials, private
  reasons, native output, or secrets

#### Scenario: Post-capture evidence failure blocks later capture

- **WHEN** native capture succeeds but capture-completed audit or audited frame
  send fails
- **THEN** the runtime closes the adapter, sends no unaudited frame, and keeps
  later native capture locally blocked under that authorization
- **AND** failure diagnostics MUST NOT expose frame data, screen contents,
  identifiers, paths, tokens, pairing codes, credentials, native output, or
  secrets

#### Scenario: Helper lifecycle remains consent scoped

- **WHEN** reusable Windows capture is enabled by an audited request
- **THEN** the runtime MUST NOT run the helper before explicit visible host
  approval or after screen-capable lifecycle loss
- **AND** it MUST NOT detach the helper, install services, configure startup
  persistence, run unattended, capture hidden sessions, access credentials,
  keylog, inject input, evade AV/EDR, bypass Windows prompts, or hide the active
  host session indicator
