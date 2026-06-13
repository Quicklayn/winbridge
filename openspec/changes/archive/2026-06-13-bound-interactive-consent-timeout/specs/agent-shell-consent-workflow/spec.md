## MODIFIED Requirements

### Requirement: Managed runtime option validation
The managed agent shell runtime SHALL validate direct runtime options before opening a relay connection or sending any protocol message. Invalid role, relay URL, relay token, identifiers, display name, requested permissions, revoke permission, visible session flag, host decision, host consent provider, host consent timeout, authorization TTL, lifecycle workflow timer delays, or blank, untrimmed, or oversized workflow reason options MUST fail closed before relay startup. Display name values MUST be non-blank, already trimmed, 120 characters or less, contain no ASCII control characters, and contain no Unicode bidirectional formatting controls. Host consent timeout values MUST be exact positive integers from `1` through the safe timer delay bound and MUST only be configured when an interactive host decision provider is configured. Authorization TTL values MUST be positive integers from `1` through the safe timer delay bound. Lifecycle workflow timer delays MUST remain bounded integers from `0` through the safe timer delay bound. Relay runtime token values MUST be non-blank, already trimmed, 1024 UTF-8 bytes or less, and contain no ASCII control characters. Relay URLs MUST NOT carry embedded credentials, canonical `token` query parameters, or case-variant `token` query parameters; relay shared tokens MUST use the dedicated runtime token path.

#### Scenario: Malformed runtime options fail before relay startup
- **WHEN** caller code creates a managed runtime with an invalid relay URL, session id, pairing code, peer id, device id, display name, requested permission, revoke permission, visible session flag, host decision, host consent provider, host consent timeout, authorization TTL, lifecycle workflow timer delay, or workflow reason
- **THEN** runtime creation fails before opening a relay connection
- **AND** it MUST NOT send join, authorization, lifecycle, signal, or audit messages

#### Scenario: Malformed host consent timeout fails before relay startup
- **WHEN** caller code creates a managed runtime with a zero, fractional, negative, non-finite, timer-unsafe, or providerless host consent timeout value
- **THEN** runtime creation fails before opening a relay connection or sending any protocol message

### Requirement: Agent shell CLI argument validation
The agent shell SHALL reject malformed, unknown, or ambiguous CLI arguments before starting the runtime, including duplicate requested permissions and requested permission entries that are not exact canonical permission tokens. Relay URLs MUST NOT contain embedded credentials/userinfo, canonical `token` query parameters, or case-variant `token` query parameters, and relay shared-token values MUST be supplied through `--token` rather than embedded in `--relay` URLs. CLI display name values MUST be non-blank, already trimmed, 120 characters or less, contain no ASCII control characters, and contain no Unicode bidirectional formatting controls. CLI token values MUST be non-blank, already trimmed, 1024 UTF-8 bytes or less, and contain no ASCII control characters. CLI audit log path values MUST be non-blank, already trimmed, 1024 UTF-8 bytes or less, and contain no ASCII control characters. Authorization TTL validation SHALL require `--authorization-ttl-ms` values to be positive integers from `1` through the safe timer delay bound. Host consent timeout validation SHALL require `--host-consent-timeout-ms` values to be exact positive integers from `1` through the safe timer delay bound and only allow them with `--host-consent-prompt true`. Lifecycle workflow timer validation SHALL allow `--revoke-after-ms`, `--pause-after-ms`, `--resume-after-ms`, `--terminate-after-ms`, and `--disconnect-after-ms` values from `0` through the safe timer delay bound.

#### Scenario: Malformed host consent timeout option is rejected
- **WHEN** the agent shell is started with a zero, fractional, negative, non-finite, timer-unsafe, or prompt-disabled `--host-consent-timeout-ms` value
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

### Requirement: Interactive host consent prompt
The host agent shell SHALL support an opt-in interactive consent path that asks the host operator to approve or deny a received `session-authorization-request` before sending any authorization decision. Interactive prompt waiting SHALL be bounded by a positive host consent timeout with a default of `60000` milliseconds. This prompt path is a development host workflow only and MUST NOT authorize screen capture, input, clipboard access, file transfer, diagnostics, reconnect, hidden sessions, stealth persistence, or consent bypass.

#### Scenario: Host approves through interactive prompt
- **WHEN** a host shell is configured for interactive consent and receives a same-session authorization request from the observed viewer
- **AND** the host operator explicitly enters the exact accepted approval response before the host consent timeout expires
- **THEN** the shell sends the same approved authorization decision, audit event, visible-session-gated active state, indicator event, and lifecycle simulations that the static approve workflow would send
- **AND** active visible state remains withheld unless `visibleToHost` is true

#### Scenario: Host denies through interactive prompt
- **WHEN** a host shell is configured for interactive consent and receives a same-session authorization request from the observed viewer
- **AND** the host operator explicitly enters the exact accepted denial response before the host consent timeout expires
- **THEN** the shell sends the same denied authorization decision and denied audit event that the static deny workflow would send
- **AND** it MUST NOT emit active visible state, grant permissions, start capture, send input, or enable signal authorization

#### Scenario: Prompt timeout fails closed
- **WHEN** an interactive host consent prompt waits longer than the configured host consent timeout
- **THEN** the prompt result is treated as no accepted decision
- **AND** the host shell MUST NOT send approval, denial, active state, session-control, permission-revoked, signal, or workflow audit messages for that request
- **AND** it logs only secret-safe metadata about the timeout

#### Scenario: Whitespace-padded prompt response fails closed
- **WHEN** an interactive host consent prompt receives input with leading or trailing whitespace around `approve` or `deny`
- **THEN** the prompt result is treated as no accepted decision
- **AND** the host shell MUST NOT send approval, denial, active state, session-control, permission-revoked, signal, or workflow audit messages for that request

#### Scenario: Prompt cancellation or invalid response fails closed
- **WHEN** an interactive host consent prompt is cancelled, fails, times out, or returns anything other than the exact accepted approval or denial response
- **THEN** the host shell MUST NOT send approval, denial, active state, session-control, permission-revoked, signal, or workflow audit messages for that request
- **AND** it logs only secret-safe metadata about the prompt outcome

#### Scenario: Prompt resolves after viewer disconnect
- **WHEN** an interactive host consent prompt is waiting for a decision
- **AND** the requesting viewer disconnects before the prompt returns approval or denial
- **THEN** the host shell MUST NOT send approval, denial, active state, session-control, permission-revoked, signal, or workflow audit messages for that stale request
- **AND** it logs only secret-safe metadata about the skipped decision

#### Scenario: Interactive consent is mutually exclusive with static host decision
- **WHEN** host prompt mode is enabled
- **THEN** static `hostDecision` approval or denial MUST NOT also be configured as an additional decision source
- **AND** invalid configuration fails before opening a relay connection

#### Scenario: Interactive prompt diagnostics are secret-safe
- **WHEN** the host shell prompts, resolves, cancels, times out, or rejects an interactive consent decision
- **THEN** prompt text, runtime events, errors, and logs MAY include bounded metadata such as requested permission names, permission count, and timeout milliseconds
- **AND** they MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, display names, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents
