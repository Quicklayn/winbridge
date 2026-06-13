## MODIFIED Requirements

### Requirement: Managed runtime option validation
The managed agent shell runtime SHALL validate direct runtime options before opening a relay connection or sending any protocol message. Invalid role, relay URL, relay token, identifiers, display name, requested permissions, revoke permission, visible session flag, host decision, host consent provider, host consent timeout, authorization TTL, lifecycle workflow timer delays, or blank, untrimmed, oversized, ASCII control-character, or Unicode bidirectional or zero-width formatting-control workflow reason options MUST fail closed before relay startup. Display name values MUST be non-blank, already trimmed, 120 characters or less, contain no ASCII control characters, and contain no Unicode bidirectional or zero-width formatting controls. Host consent timeout values MUST be exact positive integers from `1` through the safe timer delay bound and MUST only be configured when an interactive host decision provider is configured. Authorization TTL values MUST be positive integers from `1` through the safe timer delay bound. Lifecycle workflow timer delays MUST remain bounded integers from `0` through the safe timer delay bound. Workflow reason values MUST contain no ASCII control characters and no Unicode bidirectional or zero-width formatting controls including `U+FEFF`. Relay runtime token values MUST be non-blank, already trimmed, 1024 UTF-8 bytes or less, contain no ASCII control characters, contain no Unicode bidirectional formatting controls, and contain no zero-width formatting controls including `U+FEFF`. Relay URLs MUST NOT carry embedded credentials, canonical `token` query parameters, or case-variant `token` query parameters; relay shared tokens MUST use the dedicated runtime token path.

#### Scenario: Malformed runtime options fail before relay startup
- **WHEN** caller code creates a managed runtime with an invalid relay URL, session id, pairing code, peer id, device id, display name, requested permission, revoke permission, visible session flag, host decision, host consent provider, host consent timeout, authorization TTL, lifecycle workflow timer delay, or workflow reason
- **THEN** runtime creation fails before opening a relay connection
- **AND** it MUST NOT send join, authorization, lifecycle, signal, or audit messages

#### Scenario: Malformed host consent timeout fails before relay startup
- **WHEN** caller code creates a managed runtime with a zero, fractional, negative, non-finite, timer-unsafe, or providerless host consent timeout value
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Zero runtime authorization TTL fails before relay startup
- **WHEN** caller code creates a managed runtime with `authorizationTtlMs: 0`
- **THEN** runtime creation fails before opening a relay connection, sending any protocol message, or scheduling workflow timers

#### Scenario: Zero runtime lifecycle delay remains valid
- **WHEN** caller code creates a managed runtime with `hostRevokeAfterMs`, `hostPauseAfterMs`, `hostResumeAfterMs`, `hostTerminateAfterMs`, or `hostDisconnectAfterMs` set to `0`
- **THEN** runtime creation succeeds without weakening the authorization TTL requirement

#### Scenario: Untrimmed runtime workflow reason fails before relay startup
- **WHEN** caller code creates a managed runtime with a workflow reason option containing leading or trailing whitespace
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Control-character runtime workflow reason fails before relay startup
- **WHEN** caller code creates a managed runtime with a workflow reason option containing an ASCII control character
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Format-control runtime workflow reason fails before relay startup
- **WHEN** caller code creates a managed runtime with a workflow reason option containing a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Untrimmed runtime display name fails before relay startup
- **WHEN** caller code creates a managed runtime with a display name that has leading or trailing whitespace
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Control-character runtime display name fails before relay startup
- **WHEN** caller code creates a managed runtime with a display name that contains an ASCII control character
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Format-control runtime display name fails before relay startup
- **WHEN** caller code creates a managed runtime with a display name that contains a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

#### Scenario: Relay URL credentials are rejected
- **WHEN** caller code creates a managed runtime with a relay URL containing a username, password, empty userinfo marker, canonical `token` query parameter, or case-variant `token` query parameter
- **THEN** runtime creation fails before opening a relay connection
- **AND** the runtime requires relay shared tokens to be provided through the dedicated token option instead of the URL

#### Scenario: Malformed runtime token is rejected
- **WHEN** caller code creates a managed runtime with an empty, whitespace-only, untrimmed, control-character, Unicode bidirectional formatting control, zero-width formatting control including `U+FEFF`, oversized, or non-string relay token
- **THEN** runtime creation fails before opening a relay connection

### Requirement: Agent shell CLI argument validation
The agent shell SHALL reject malformed, unknown, or ambiguous CLI arguments before starting the runtime, including duplicate requested permissions and requested permission entries that are not exact canonical permission tokens. Relay URLs MUST NOT contain embedded credentials/userinfo, canonical `token` query parameters, or case-variant `token` query parameters, and relay shared-token values MUST be supplied through `--token` rather than embedded in `--relay` URLs. CLI display name values MUST be non-blank, already trimmed, 120 characters or less, contain no ASCII control characters, and contain no Unicode bidirectional or zero-width formatting controls. CLI token values MUST be non-blank, already trimmed, 1024 UTF-8 bytes or less, contain no ASCII control characters, contain no Unicode bidirectional formatting controls, and contain no zero-width formatting controls including `U+FEFF`. CLI audit log path values MUST be non-blank, already trimmed, 1024 UTF-8 bytes or less, contain no ASCII control characters, contain no Unicode bidirectional formatting controls, and contain no zero-width formatting controls. CLI workflow reason values MUST be non-blank, already trimmed, 240 characters or less, contain no ASCII control characters, and contain no Unicode bidirectional or zero-width formatting controls including `U+FEFF`. Authorization TTL validation SHALL require `--authorization-ttl-ms` values to be positive integers from `1` through the safe timer delay bound. Host consent timeout validation SHALL require `--host-consent-timeout-ms` values to be exact positive integers from `1` through the safe timer delay bound and only allow them with `--host-consent-prompt true`. Lifecycle workflow timer validation SHALL allow `--revoke-after-ms`, `--pause-after-ms`, `--resume-after-ms`, `--terminate-after-ms`, and `--disconnect-after-ms` values from `0` through the safe timer delay bound.

#### Scenario: Malformed host consent timeout option is rejected
- **WHEN** the agent shell is started with a zero, fractional, negative, non-finite, timer-unsafe, or prompt-disabled `--host-consent-timeout-ms` value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Unknown CLI option is rejected
- **WHEN** the agent shell is started with an option name that is not part of the documented CLI
- **THEN** it exits through bounded usage handling before connecting to the relay

#### Scenario: Invalid relay URL option is rejected
- **WHEN** the agent shell is started with a malformed, relative, or non-WebSocket `--relay` URL
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Relay URL credentials are rejected
- **WHEN** the agent shell is started with a `--relay` URL containing a username, password, empty userinfo marker, canonical `token` query parameter, or case-variant `token` query parameter
- **THEN** it exits through bounded usage handling before connecting to the relay
- **AND** the operator must supply relay shared tokens through `--token`

#### Scenario: Invalid session metadata is rejected
- **WHEN** the agent shell is started with malformed session id, pairing code, peer id, or device id metadata
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Invalid display name is rejected
- **WHEN** the agent shell is started with an empty, whitespace-only, untrimmed, oversized, control-character, or Unicode formatting-control `--name` value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Invalid CLI token is rejected
- **WHEN** the agent shell is started with an empty, whitespace-only, untrimmed, control-character, Unicode bidirectional formatting-control, zero-width formatting-control including `U+FEFF`, oversized, or otherwise malformed `--token` value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Invalid audit log path is rejected
- **WHEN** the agent shell is started with an empty, whitespace-only, untrimmed, control-character, Unicode bidirectional formatting-control, zero-width formatting-control including `U+FEFF`, oversized, or otherwise malformed `--audit-log` value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Invalid requested permissions are rejected
- **WHEN** the agent shell is started with a requested permission list containing unknown, untrimmed, empty, or duplicate permission entries
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Invalid host decision is rejected
- **WHEN** the agent shell is started with a host decision outside `none`, `approve`, or `deny`
- **THEN** it exits through bounded usage handling before connecting to the relay

#### Scenario: Static host decision conflicts with prompt mode
- **WHEN** the agent shell is started with `--host-consent-prompt true` and a static approval or denial decision
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Invalid visible-session option is rejected
- **WHEN** the agent shell is started with a visible-session value outside `true` or `false`
- **THEN** it exits through bounded usage handling before connecting to the relay

#### Scenario: Invalid authorization TTL option is rejected
- **WHEN** the agent shell is started with a zero, fractional, negative, non-finite, or timer-unsafe `--authorization-ttl-ms` value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Zero lifecycle delay remains valid
- **WHEN** the agent shell is started with `--revoke-after-ms`, `--pause-after-ms`, `--resume-after-ms`, `--terminate-after-ms`, or `--disconnect-after-ms` set to `0`
- **THEN** argument parsing succeeds without weakening the authorization TTL requirement

#### Scenario: Invalid lifecycle delay option is rejected
- **WHEN** the agent shell is started with a fractional, negative, non-finite, or timer-unsafe lifecycle delay value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Invalid revoke permission is rejected
- **WHEN** the agent shell is started with a revoke permission outside the canonical permission set
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Untrimmed CLI workflow reason is rejected
- **WHEN** the agent shell is started with a workflow reason option containing leading or trailing whitespace
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Control-character CLI workflow reason is rejected
- **WHEN** the agent shell is started with a workflow reason option containing an ASCII control character
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Format-control CLI workflow reason is rejected
- **WHEN** the agent shell is started with a workflow reason option containing a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: CLI usage diagnostics are secret-safe
- **WHEN** CLI argument parsing fails because of malformed local arguments or environment-derived audit log paths
- **THEN** usage output and local errors MUST NOT expose raw relay tokens, pairing codes, protocol payloads, private workflow reason text, audit log path text, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents

## ADDED Requirements

### Requirement: Canonical agent-shell workflow reasons
The agent shell SHALL reject CLI and direct runtime workflow reason options when they are blank, oversized, not already trimmed, contain ASCII control characters, or contain Unicode bidirectional or zero-width formatting controls including `U+FEFF`. Rejection MUST occur before relay connection, socket write, local trusted `sent` event emission, or host workflow simulation, and MUST NOT weaken consent, visibility, authorization, redaction, or fail-closed gates.

#### Scenario: CLI workflow reason is untrimmed
- **WHEN** the agent-shell CLI is started with `--revoke-reason`, `--pause-reason`, `--resume-reason`, or `--terminate-reason` containing leading or trailing whitespace
- **THEN** argument parsing MUST fail before the runtime starts or connects to a relay

#### Scenario: CLI workflow reason contains ASCII control characters
- **WHEN** the agent-shell CLI is started with `--revoke-reason`, `--pause-reason`, `--resume-reason`, or `--terminate-reason` containing an ASCII control character
- **THEN** argument parsing MUST fail before the runtime starts or connects to a relay

#### Scenario: CLI workflow reason contains Unicode formatting controls
- **WHEN** the agent-shell CLI is started with `--revoke-reason`, `--pause-reason`, `--resume-reason`, or `--terminate-reason` containing a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** argument parsing MUST fail before the runtime starts or connects to a relay

#### Scenario: Direct runtime workflow reason is untrimmed
- **WHEN** direct managed runtime options include a workflow reason with leading or trailing whitespace
- **THEN** the runtime MUST reject the options before opening a relay connection or sending any workflow message

#### Scenario: Direct runtime workflow reason contains ASCII control characters
- **WHEN** direct managed runtime options include a workflow reason with an ASCII control character
- **THEN** the runtime MUST reject the options before opening a relay connection or sending any workflow message

#### Scenario: Direct runtime workflow reason contains Unicode formatting controls
- **WHEN** direct managed runtime options include a workflow reason with a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the runtime MUST reject the options before opening a relay connection or sending any workflow message

#### Scenario: Agent-shell reason rejection is secret-safe
- **WHEN** agent-shell workflow reason validation rejects malformed input
- **THEN** thrown errors, usage output, runtime events, and logs MUST NOT expose raw private reason text, tokens, pairing codes, protocol payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents
