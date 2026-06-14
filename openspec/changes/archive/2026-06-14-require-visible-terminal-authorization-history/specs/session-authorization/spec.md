## ADDED Requirements

### Requirement: Post-activation terminal authorization records preserve host visibility
The system SHALL reject parsed post-activation terminal authorization records that report `visibleToHost: false` before any remote action authorization check, runtime workflow, adapter, or audit consumer can treat the record as trusted lifecycle evidence. `revoked` and `terminated` records MUST preserve `visibleToHost: true`, and `expired` records with activation history MUST preserve `visibleToHost: true`. `denied` records and non-activated `expired` records MUST remain valid with `visibleToHost: false` when they represent consent-first pre-access terminal outcomes.

#### Scenario: Revoked record is not visible
- **WHEN** a parsed `revoked` authorization record reports `visibleToHost: false`
- **THEN** the schema rejects the record before it can be used for remote action authorization or lifecycle evidence
- **AND** the rejection MUST NOT grant permissions, activate hidden host state, start capture, send input, reconnect peers, or bypass consent workflows

#### Scenario: Terminated record is not visible
- **WHEN** a parsed `terminated` authorization record reports `visibleToHost: false`
- **THEN** the schema rejects the record before it can be used for remote action authorization or lifecycle evidence
- **AND** the rejection MUST NOT grant permissions, activate hidden host state, start capture, send input, reconnect peers, or bypass consent workflows

#### Scenario: Post-activation expired record is not visible
- **WHEN** a parsed `expired` authorization record carries `activatedAt` and reports `visibleToHost: false`
- **THEN** the schema rejects the record before it can be used for remote action authorization or lifecycle evidence
- **AND** the rejection MUST NOT grant permissions, activate hidden host state, start capture, send input, reconnect peers, or bypass consent workflows

#### Scenario: Valid visible terminal history remains accepted
- **WHEN** a `revoked`, `terminated`, or post-activation `expired` authorization record preserves `visibleToHost: true`, no permissions, and ordered approval, activation, and terminal timestamp history
- **THEN** the schema accepts the fail-closed terminal record
- **AND** remote action checks remain denied

#### Scenario: Pre-access terminal records remain invisible
- **WHEN** a `denied` authorization record or non-activated `expired` authorization record reports `visibleToHost: false`
- **THEN** the schema accepts the fail-closed pre-access terminal record
- **AND** remote action checks remain denied
