## MODIFIED Requirements

### Requirement: Interactive host consent prompt
The host agent shell SHALL support an opt-in interactive consent path that asks the host operator to approve or deny a received `session-authorization-request` before sending any authorization decision. The prompt SHALL show the host operator the requesting viewer identity using bounded metadata from the observed viewer peer and SHALL show the requested permission names and count before accepting input. Interactive prompt metadata rendering MUST independently validate prompt request fields before writing host-facing text; invalid optional display-name or request-reason values MUST render as `unavailable`, and invalid required peer-id or requested-permission values MUST render bounded placeholder text without echoing raw unsafe values. Interactive prompt waiting SHALL be bounded by a positive host consent timeout with a default of `60000` milliseconds. This prompt path is a development host workflow only and MUST NOT authorize screen capture, input, clipboard access, file transfer, diagnostics, reconnect, hidden sessions, stealth persistence, or consent bypass.

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

#### Scenario: Prompt shows viewer identity and requested permissions
- **WHEN** a host shell is configured for interactive consent and receives a same-session authorization request from the observed viewer
- **THEN** the host-facing prompt text MUST include the trusted viewer peer id, the validated viewer display name when available, the requested permission names, and the requested permission count before asking for `approve` or `deny`
- **AND** it MUST NOT use unbound authorization request fields, unvalidated display names, raw protocol payloads, tokens, pairing codes, private reasons, signal payloads, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, or credentials as prompt identity content

#### Scenario: Prompt sanitizes direct helper metadata
- **WHEN** the interactive host consent prompt helper is called directly with an unsafe viewer display name, malformed viewer peer id, unsafe request reason, or malformed requested permission
- **THEN** the host-facing prompt text MUST render only bounded placeholders for those unsafe fields before asking for `approve` or `deny`
- **AND** it MUST NOT expose the raw unsafe display name, raw malformed peer id, raw unsafe request reason, raw malformed permission, protocol payloads, tokens, pairing codes, credentials, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, input contents, or full secrets
- **AND** this rendering MUST NOT approve authorization, activate visibility, grant permissions, start capture, send input, reconnect peers, suppress host visibility, or bypass consent workflows

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
- **THEN** prompt text MAY include bounded host-facing consent metadata such as the trusted viewer peer id, validated viewer display name, requested permission names, requested permission count, and timeout milliseconds
- **AND** authorization decision/state events, errors, logs, and audit records MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, display names, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents
- **AND** prompt text MUST NOT expose raw protocol payloads, tokens, pairing codes, private reasons, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, input contents, credentials, or unvalidated identity values
