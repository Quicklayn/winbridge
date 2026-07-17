## ADDED Requirements

### Requirement: Agent shell binds Windows input helper lifetime to host authorization

An opted-in host agent runtime SHALL own at most one reusable Windows input
adapter for its current foreground runtime. The runtime MUST close the adapter
when authorization is paused, any permission is revoked, authorization is
terminated or expires, either peer disconnects, the socket closes, the runtime
stops, or connection-scoped authorization is replaced. Adapter close failure
MUST NOT delay or suppress the host lifecycle action.

After adapter success, the runtime MUST revalidate the current sender, routing,
authorization id, active visible unexpired state, required input permission,
and peer connectivity before persisting trusted `input-event.applied` evidence
or emitting a trusted received event.

#### Scenario: Active host runtime reuses its adapter

- **WHEN** an opted-in host receives multiple authorized input events during
  one active visible authorization
- **THEN** it routes them through the same runtime-owned adapter instance while
  retaining application-requested audit before every adapter call
- **AND** it writes input-applied audit only after each adapter success and
  post-success authorization revalidation

#### Scenario: Pause closes pending native input

- **WHEN** the host pauses while native input is active or queued
- **THEN** the runtime attempts adapter close before later input can be applied
  and blocks new events until a valid resume restores active authorization
- **AND** late adapter success MUST NOT create trusted applied evidence or a
  trusted received event

#### Scenario: Revocation or terminal lifecycle closes pending native input

- **WHEN** the host revokes a permission, terminates, expires, disconnects, or
  loses the viewer while native input is active or queued
- **THEN** the runtime attempts adapter close and no queued event may produce
  trusted applied evidence after that lifecycle boundary

#### Scenario: Runtime stop and socket close release the helper

- **WHEN** an opted-in host runtime stops or its relay socket closes
- **THEN** it attempts adapter close without starting a replacement helper,
  reconnecting peers, suppressing the host indicator transition, or delaying
  shutdown on native diagnostics
- **AND** runtime stop blocks input and attempts close before deactivating the
  visible host indicator

#### Scenario: Resume requires fresh validation

- **WHEN** the host resumes after pause and later receives another input event
- **THEN** the event must pass the ordinary sender, routing, authorization,
  visibility, expiry, connectivity, and permission gates before the adapter may
  start a fresh helper generation

#### Scenario: Lifecycle audit failure keeps native input blocked

- **WHEN** pause, revoke, terminate, expiration, or disconnect begins and its
  lifecycle audit persistence fails before protocol state can be updated
- **THEN** the runtime keeps native input locally blocked and does not invoke
  the adapter for later input under the stale authorization view
- **AND** adapter close or audit diagnostics MUST NOT expose coordinates,
  buttons, keys, modifiers, raw payloads, tokens, pairing codes, credentials,
  private reasons, or secrets

#### Scenario: Helper lifecycle remains consent scoped

- **WHEN** reusable Windows input is enabled
- **THEN** the runtime MUST NOT run the helper before explicit visible host
  approval or after action-capable lifecycle loss
- **AND** it MUST NOT detach the helper, install services, configure startup
  persistence, run unattended, capture or keylog input, access credentials,
  elevate privileges, evade AV/EDR, bypass Windows prompts, or hide the active
  host session indicator
