## ADDED Requirements

### Requirement: Post-activation terminal authorization records preserve live-session history
The system SHALL reject parsed `revoked`, `terminated`, and visible `expired` authorization records that lack prior approval or visible activation timestamp history before any remote action authorization check, runtime workflow, adapter, or audit consumer can treat the record as trusted lifecycle evidence. `denied` records and non-visible `expired` records MUST remain valid without activation history when they represent consent-first pre-access terminal outcomes.

#### Scenario: Terminal record lacks approval history
- **WHEN** a parsed `revoked`, `terminated`, or visible `expired` authorization record lacks `approvedAt`
- **THEN** the schema rejects the record before it can be used for remote action authorization or lifecycle evidence
- **AND** the rejection MUST NOT grant permissions, activate host visibility, start capture, send input, reconnect peers, or bypass consent workflows

#### Scenario: Terminal record lacks activation history
- **WHEN** a parsed `revoked`, `terminated`, or visible `expired` authorization record lacks `activatedAt`
- **THEN** the schema rejects the record before it can be used for remote action authorization or lifecycle evidence
- **AND** the rejection MUST NOT grant permissions, activate host visibility, start capture, send input, reconnect peers, or bypass consent workflows

#### Scenario: Valid terminal live history remains accepted
- **WHEN** a `revoked`, `terminated`, or visible `expired` authorization record preserves prior `approvedAt`, `activatedAt`, and ordered terminal timestamp history from a visible active or paused session
- **THEN** the schema accepts the fail-closed terminal record with no permissions
- **AND** remote action checks remain denied

#### Scenario: Denied records remain pre-access terminal records
- **WHEN** a `denied` authorization record has `deniedAt`, no permissions, no `approvedAt`, and no `activatedAt`
- **THEN** the schema accepts the fail-closed denial record as a pre-access terminal outcome
- **AND** remote action checks remain denied

#### Scenario: Non-visible expired records remain pre-access terminal records
- **WHEN** a non-visible `expired` authorization record has `expiredAt`, no permissions, and no `activatedAt`
- **THEN** the schema accepts the fail-closed expiration record as a pre-access timeout outcome
- **AND** remote action checks remain denied
