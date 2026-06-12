## MODIFIED Requirements

### Requirement: Managed runtime option validation
The managed agent shell runtime SHALL validate direct runtime options before opening a relay connection or sending any protocol message. Invalid role, relay URL, relay token, identifiers, display name, requested permissions, revoke permission, visible session flag, host decision, workflow timer delays, or workflow reason options MUST fail closed before relay startup. Relay URLs MUST NOT carry embedded credentials or token query parameters; relay shared tokens MUST use the dedicated runtime token path.

#### Scenario: Malformed runtime options fail before relay startup
- **WHEN** caller code creates a managed runtime with an invalid relay URL, session id, pairing code, peer id, device id, display name, requested permission, revoke permission, visible session flag, host decision, workflow timer delay, or workflow reason
- **THEN** runtime creation fails before opening a relay connection
- **AND** it MUST NOT send join, authorization, lifecycle, signal, or audit messages

#### Scenario: Relay URL credentials are rejected
- **WHEN** caller code creates a managed runtime with a relay URL containing a username, password, empty userinfo marker, or `token` query parameter
- **THEN** runtime creation fails before opening a relay connection
- **AND** the runtime requires relay shared tokens to be provided through the dedicated token option instead of the URL

#### Scenario: Malformed runtime token is rejected
- **WHEN** caller code creates a managed runtime with an empty, whitespace-only, control-character, oversized, or non-string relay token
- **THEN** runtime creation fails before opening a relay connection

### Requirement: Agent shell CLI argument validation
The agent shell SHALL reject malformed, unknown, or ambiguous CLI arguments before starting the runtime, including duplicate requested permissions. Relay URLs MUST NOT contain embedded credentials/userinfo, and relay shared-token values MUST be supplied through `--token` rather than embedded in `--relay` URLs. CLI token values MUST be non-blank, 1024 UTF-8 bytes or less, and contain no ASCII control characters. Workflow timer validation SHALL include `--disconnect-after-ms`.

#### Scenario: Unknown CLI option is rejected
- **WHEN** the agent shell is started with an option name that is not part of the documented CLI
- **THEN** it exits through bounded usage handling before connecting to the relay

#### Scenario: Invalid relay URL option is rejected
- **WHEN** the agent shell is started with a malformed, relative, or non-WebSocket `--relay` URL
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Relay URL credentials are rejected
- **WHEN** the agent shell is started with a `--relay` value containing username or password/userinfo credentials
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Relay URL token query is rejected
- **WHEN** the agent shell is started with a `--relay` value containing a `token` query parameter
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Visible session value is explicit
- **WHEN** the agent shell is started with `--visible-session`
- **THEN** the value MUST be either `true` or `false`

#### Scenario: Invalid permission option is rejected
- **WHEN** the agent shell is started with an invalid requested or revocation permission value
- **THEN** it exits through bounded usage handling before sending any protocol message

#### Scenario: Duplicate requested permission is rejected
- **WHEN** the agent shell is started with the same requested permission more than once
- **THEN** it exits through bounded usage handling before connecting to the relay or sending a session authorization request

#### Scenario: Invalid identifier option is rejected
- **WHEN** the agent shell is started with a malformed `--session`, `--peer`, or `--device` identifier
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Invalid display name option is rejected
- **WHEN** the agent shell is started with an empty, whitespace-only, or oversized `--name` value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Malformed token option is rejected
- **WHEN** the agent shell is started with an empty, whitespace-only, control-character, or oversized `--token` value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Oversized workflow timer option is rejected
- **WHEN** the agent shell is started with `--authorization-ttl-ms`, `--revoke-after-ms`, `--pause-after-ms`, `--resume-after-ms`, `--terminate-after-ms`, or `--disconnect-after-ms` above the safe timer delay bound
- **THEN** it exits through bounded usage handling before connecting to the relay or scheduling workflow timers

#### Scenario: Invalid lifecycle reason option is rejected
- **WHEN** the agent shell is started with a blank or oversized lifecycle reason option
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Blank audit log path option is rejected
- **WHEN** the agent shell is started with an empty or whitespace-only `--audit-log` value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Valid omitted options keep safe defaults
- **WHEN** the agent shell is started with only a valid role
- **THEN** omitted consent-sensitive options keep fail-closed defaults such as no requested permissions, no host decision, and no visible session

#### Scenario: CLI parses disconnect simulation delay
- **WHEN** the agent shell is started with a valid `--disconnect-after-ms` value
- **THEN** it constructs a matching bounded runtime disconnect delay option

## ADDED Requirements

### Requirement: Host disconnect simulation
The host shell SHALL close its local relay connection after visible activation only when disconnect simulation is explicitly configured. The disconnect simulation MUST NOT send peer-originated `peer-disconnected` protocol messages; disconnect notices remain relay-originated.

#### Scenario: Host disconnects after visible activation
- **WHEN** the host shell is explicitly configured to approve, visible session state is true, and a disconnect delay is configured
- **THEN** it sends an approved decision, sends active visible state, closes the host WebSocket after the delay, and the viewer receives a relay-originated `peer-disconnected` notice

#### Scenario: Disconnect configured without visible activation
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it does not close the host WebSocket because of disconnect simulation

#### Scenario: Disconnect suppresses later host workflow
- **WHEN** disconnect simulation fires before delayed revoke, pause, resume, termination, or expiration simulation
- **THEN** the host shell MUST NOT send later authorization state, session control, permission revoke, or workflow audit-event messages for that disconnected connection

#### Scenario: Disconnect simulation safety boundary
- **WHEN** the host shell runs disconnect simulation
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session, send forged disconnect notices, or bypass consent workflows
