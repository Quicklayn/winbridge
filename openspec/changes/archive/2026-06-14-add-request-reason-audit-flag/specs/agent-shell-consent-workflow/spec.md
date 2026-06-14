## MODIFIED Requirements

### Requirement: Host workflow audit-event simulation
The host shell SHALL emit secret-safe development `audit-event` protocol messages for explicit host authorization decisions, visible activation, delayed or direct permission revocation, and delayed or direct session termination. Host authorization decision audit-event details SHALL include secret-safe `requestReasonProvided` boolean metadata that records only whether the validated viewer authorization request included a request reason.

#### Scenario: Host approval audit event
- **WHEN** the host shell approves an authorization request
- **THEN** it sends an `audit-event` with accepted outcome, secret-safe granted permission count metadata, and `requestReasonProvided` metadata

#### Scenario: Host denial audit event
- **WHEN** the host shell denies an authorization request
- **THEN** it sends an `audit-event` with denied outcome, secret-safe requested permission count metadata, host decision reason configuration metadata, and `requestReasonProvided` metadata

#### Scenario: Visible activation audit event
- **WHEN** the host shell emits active visible session state
- **THEN** it sends an `audit-event` with accepted outcome and visible host metadata

#### Scenario: Permission revoke audit event
- **WHEN** the host shell sends a delayed or direct permission revocation
- **THEN** it sends an `audit-event` with accepted outcome, revoked permission identifier, and remaining permission count

#### Scenario: Session termination audit event
- **WHEN** the host shell sends delayed or direct session termination
- **THEN** it sends an `audit-event` with accepted outcome, visible host metadata, and previously granted permission count

#### Scenario: Request reason presence audit metadata is secret-safe
- **WHEN** the host shell sends an authorization approval or denial audit-event for a request that included a viewer request reason
- **THEN** the audit-event detail includes `requestReasonProvided=true`
- **AND** the protocol audit-event, local audit record, runtime events, logs, and status output MUST NOT include the raw viewer request reason text

#### Scenario: Omitted request reason audit metadata remains explicit
- **WHEN** the host shell sends an authorization approval or denial audit-event for a request that omitted a viewer request reason
- **THEN** the audit-event detail includes `requestReasonProvided=false`
- **AND** the omitted reason metadata MUST NOT invent consent context, approve authorization, activate visibility, grant permissions, start capture, or send input

#### Scenario: Agent shell audit-event details are secret-safe
- **WHEN** the host shell sends development audit-event messages
- **THEN** audit details MUST NOT contain raw tokens, raw pairing codes, credentials, display names, signal payloads, keystrokes, screenshots, screen contents, or raw request/denial/revocation/termination reason text
