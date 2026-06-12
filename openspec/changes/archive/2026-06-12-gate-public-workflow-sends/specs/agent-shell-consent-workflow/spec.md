## ADDED Requirements

### Requirement: Public workflow-authority send gate
The agent shell SHALL reject public managed runtime `send()` calls for workflow-authority protocol messages before socket write and before local `sent` event emission. Workflow-authority protocol messages include `session-authorization-decision`, `session-authorization-state`, `permission-revoked`, `session-control`, and `audit-event`.

#### Scenario: Public authorization decision send is blocked
- **WHEN** caller code invokes public runtime `send()` with a `session-authorization-decision`
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked decision

#### Scenario: Public authorization lifecycle send is blocked
- **WHEN** caller code invokes public runtime `send()` with `session-authorization-state`, `permission-revoked`, or `session-control`
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked lifecycle message

#### Scenario: Public workflow audit send is blocked
- **WHEN** caller code invokes public runtime `send()` with an `audit-event`
- **THEN** the runtime MUST reject the send before writing to the socket
- **AND** the runtime MUST NOT emit a local `sent` event for that blocked audit event

#### Scenario: Internal explicit workflow sends still work
- **WHEN** the host workflow has explicit host decision configuration and visible activation, revocation, pause, resume, termination, or expiration configuration
- **THEN** the internal workflow MAY emit matching authorization, lifecycle, and development audit-event messages through its internal send path
- **AND** those internal sends MUST still preserve existing consent, visibility, revocation, timeout, peer-disconnect, and audit safety gates

#### Scenario: Blocked workflow-authority diagnostics are secret-safe
- **WHEN** the runtime blocks a public workflow-authority send
- **THEN** thrown errors, runtime events, and logs MUST NOT expose raw protocol payloads, payload keys, tokens, pairing codes, authorization reasons, audit-event details, keystrokes, screenshots, screen contents, or input contents
