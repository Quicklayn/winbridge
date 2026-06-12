## ADDED Requirements

### Requirement: Private audit detail metadata redaction
The system SHALL redact audit detail fields whose key names commonly carry raw user display-name metadata or private lifecycle reason text, while preserving bounded non-secret reason metadata.

#### Scenario: Audit details contain raw display-name metadata
- **WHEN** a component writes audit details with fields named `displayName`, `hostDisplayName`, `viewerDisplayName`, or `deviceDisplayName`
- **THEN** the audit layer MUST replace those values with `[REDACTED]` before storage, local emission, console output, file persistence, or protocol `audit-event` encoding

#### Scenario: Audit details contain raw private reason text
- **WHEN** a component writes audit details with fields named `reason`, `reasonText`, `rawReason`, `denialReason`, `revokeReason`, `pauseReason`, `resumeReason`, or `terminationReason`
- **THEN** the audit layer MUST replace those values with `[REDACTED]` before storage, local emission, console output, file persistence, or protocol `audit-event` encoding

#### Scenario: Safe reason metadata remains inspectable
- **WHEN** audit details include bounded metadata fields such as `reasonCode`, `reasonConfigured`, or `authorizationId`
- **THEN** the audit layer preserves those metadata values unless another sensitive key rule applies

#### Scenario: Private audit detail metadata is redacted recursively
- **WHEN** display-name or private-reason field names appear inside nested objects or arrays in audit details
- **THEN** the audit layer MUST redact those values recursively while preserving non-sensitive metadata
