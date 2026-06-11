# agent-shell-consent-workflow Specification

## Purpose
TBD - created by archiving change add-agent-shell-consent-workflow. Update Purpose after archive.
## Requirements
### Requirement: Managed agent shell lifecycle
The agent shell SHALL expose a managed runtime with explicit start and stop operations for tests and CLI use.

#### Scenario: Agent shell starts
- **WHEN** the agent shell runtime starts
- **THEN** it connects to the relay, sends a join message, and sends hello using the same implementation as the CLI

### Requirement: Viewer authorization request
The viewer shell SHALL send a session authorization request only when requested permissions are explicitly configured.

#### Scenario: Viewer requests screen view
- **WHEN** the viewer shell is started with requested `screen:view` permission
- **THEN** it sends a `session-authorization-request` message after joining the relay

### Requirement: Explicit host decision
The host shell SHALL NOT approve or deny authorization requests unless an explicit host decision is configured.

#### Scenario: Host decision omitted
- **WHEN** the host shell receives an authorization request and no host decision is configured
- **THEN** it logs the request without sending an approval or denial

#### Scenario: Host approves request
- **WHEN** the host shell receives an authorization request and is explicitly configured to approve with visible session state
- **THEN** it sends an approved decision and active visible state update

### Requirement: Visible active state gate
The host shell MUST NOT emit active session state unless visible session state is explicitly configured.

#### Scenario: Host approves without visible session flag
- **WHEN** the host shell is configured to approve but visible session state is false
- **THEN** it sends no active state update

