## MODIFIED Requirements

### Requirement: Agent shell display names remain canonical
The agent shell SHALL reject CLI, direct runtime, inbound `hello`, and public-send `hello` display-name values that are empty, whitespace-only, untrimmed, oversized, contain ASCII control characters, or contain Unicode bidirectional formatting controls before opening a relay connection, sending `join-session`, sending `hello`, emitting trusted local protocol events, or running consent workflow handling.

#### Scenario: CLI display name is untrimmed
- **WHEN** the agent shell is started with a `--name` value that has leading or trailing whitespace
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: CLI display name contains ASCII control characters
- **WHEN** the agent shell is started with a `--name` value that contains an ASCII control character
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: CLI display name contains Unicode bidirectional formatting controls
- **WHEN** the agent shell is started with a `--name` value that contains a Unicode bidirectional formatting control
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Direct runtime display name is untrimmed
- **WHEN** caller code creates a managed runtime with a display name that has leading or trailing whitespace
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Direct runtime display name contains ASCII control characters
- **WHEN** caller code creates a managed runtime with a display name that contains an ASCII control character
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Direct runtime display name contains Unicode bidirectional formatting controls
- **WHEN** caller code creates a managed runtime with a display name that contains a Unicode bidirectional formatting control
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Inbound untrimmed hello display name is rejected
- **WHEN** the runtime receives a `hello`-shaped payload whose display name has leading or trailing whitespace
- **THEN** the runtime rejects it before local `received` protocol event emission or peer presence handling

#### Scenario: Inbound control-character hello display name is rejected
- **WHEN** the runtime receives a `hello`-shaped payload whose display name contains an ASCII control character
- **THEN** the runtime rejects it before local `received` protocol event emission or peer presence handling

#### Scenario: Inbound bidi-control hello display name is rejected
- **WHEN** the runtime receives a `hello`-shaped payload whose display name contains a Unicode bidirectional formatting control
- **THEN** the runtime rejects it before local `received` protocol event emission or peer presence handling

#### Scenario: Public hello with untrimmed display name is blocked
- **WHEN** caller code invokes public runtime `send()` with a same-session `hello` whose display name has leading or trailing whitespace
- **THEN** the runtime rejects the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked hello

#### Scenario: Public hello with control-character display name is blocked
- **WHEN** caller code invokes public runtime `send()` with a same-session `hello` whose display name contains an ASCII control character
- **THEN** the runtime rejects the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked hello

#### Scenario: Public hello with bidi-control display name is blocked
- **WHEN** caller code invokes public runtime `send()` with a same-session `hello` whose display name contains a Unicode bidirectional formatting control
- **THEN** the runtime rejects the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked hello

#### Scenario: Rejected display-name diagnostics remain secret-safe
- **WHEN** the runtime rejects display-name metadata because it is malformed
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw display names, protocol payloads, tokens, pairing codes, private reasons, keystrokes, screenshots, screen contents, or input contents

### Requirement: Managed runtime option validation
The managed agent shell runtime SHALL validate direct runtime options before opening a relay connection or sending any protocol message. Invalid role, relay URL, relay token, identifiers, display name, requested permissions, revoke permission, visible session flag, host decision, authorization TTL, lifecycle workflow timer delays, or blank, untrimmed, or oversized workflow reason options MUST fail closed before relay startup. Display name values MUST be non-blank, already trimmed, 120 characters or less, contain no ASCII control characters, and contain no Unicode bidirectional formatting controls. Authorization TTL values MUST be positive integers from `1` through the safe timer delay bound. Lifecycle workflow timer delays MUST remain bounded integers from `0` through the safe timer delay bound. Relay runtime token values MUST be non-blank, already trimmed, 1024 UTF-8 bytes or less, and contain no ASCII control characters. Relay URLs MUST NOT carry embedded credentials, canonical `token` query parameters, or case-variant `token` query parameters; relay shared tokens MUST use the dedicated runtime token path.

#### Scenario: Malformed runtime options fail before relay startup
- **WHEN** caller code creates a managed runtime with an invalid relay URL, session id, pairing code, peer id, device id, display name, requested permission, revoke permission, visible session flag, host decision, authorization TTL, lifecycle workflow timer delay, or workflow reason
- **THEN** runtime creation fails before opening a relay connection
- **AND** it MUST NOT send join, authorization, lifecycle, signal, or audit messages

#### Scenario: Untrimmed runtime display name fails before relay startup
- **WHEN** caller code creates a managed runtime with a display name that has leading or trailing whitespace
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Control-character runtime display name fails before relay startup
- **WHEN** caller code creates a managed runtime with a display name that contains an ASCII control character
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Bidi-control runtime display name fails before relay startup
- **WHEN** caller code creates a managed runtime with a display name that contains a Unicode bidirectional formatting control
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

### Requirement: Agent shell CLI argument validation
The agent shell SHALL reject malformed, unknown, or ambiguous CLI arguments before starting the runtime, including duplicate requested permissions and requested permission entries that are not exact canonical permission tokens. Relay URLs MUST NOT contain embedded credentials/userinfo, canonical `token` query parameters, or case-variant `token` query parameters, and relay shared-token values MUST be supplied through `--token` rather than embedded in `--relay` URLs. CLI display name values MUST be non-blank, already trimmed, 120 characters or less, contain no ASCII control characters, and contain no Unicode bidirectional formatting controls. CLI token values MUST be non-blank, already trimmed, 1024 UTF-8 bytes or less, and contain no ASCII control characters. CLI audit log path values MUST be non-blank, already trimmed, 1024 UTF-8 bytes or less, and contain no ASCII control characters. Authorization TTL validation SHALL require `--authorization-ttl-ms` values to be positive integers from `1` through the safe timer delay bound. Lifecycle workflow timer validation SHALL allow `--revoke-after-ms`, `--pause-after-ms`, `--resume-after-ms`, `--terminate-after-ms`, and `--disconnect-after-ms` values from `0` through the safe timer delay bound.

#### Scenario: Invalid display name option is rejected
- **WHEN** the agent shell is started with an empty, whitespace-only, untrimmed, control-character, bidi-control, or oversized `--name` value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message
