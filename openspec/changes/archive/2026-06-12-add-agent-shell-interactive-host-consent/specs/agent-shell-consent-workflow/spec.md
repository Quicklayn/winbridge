## ADDED Requirements

### Requirement: Interactive host consent prompt
The host agent shell SHALL support an opt-in interactive consent path that asks the host operator to approve or deny a received `session-authorization-request` before sending any authorization decision. This prompt path is a development host workflow only and MUST NOT authorize screen capture, input, clipboard access, file transfer, diagnostics, reconnect, hidden sessions, stealth persistence, or consent bypass.

#### Scenario: Host approves through interactive prompt
- **WHEN** a host shell is configured for interactive consent and receives a same-session authorization request from the observed viewer
- **AND** the host operator explicitly enters the accepted approval response
- **THEN** the shell sends the same approved authorization decision, audit event, visible-session-gated active state, indicator event, and lifecycle simulations that the static approve workflow would send
- **AND** active visible state remains withheld unless `visibleToHost` is true

#### Scenario: Host denies through interactive prompt
- **WHEN** a host shell is configured for interactive consent and receives a same-session authorization request from the observed viewer
- **AND** the host operator explicitly enters the accepted denial response
- **THEN** the shell sends the same denied authorization decision and denied audit event that the static deny workflow would send
- **AND** it MUST NOT emit active visible state, grant permissions, start capture, send input, or enable signal authorization

#### Scenario: Prompt cancellation or invalid response fails closed
- **WHEN** an interactive host consent prompt is cancelled, fails, or returns anything other than the accepted approval or denial response
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
- **WHEN** the host shell prompts, resolves, cancels, or rejects an interactive consent decision
- **THEN** prompt text, runtime events, errors, and logs MAY include bounded metadata such as requested permission names and permission count
- **AND** they MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, display names, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents
