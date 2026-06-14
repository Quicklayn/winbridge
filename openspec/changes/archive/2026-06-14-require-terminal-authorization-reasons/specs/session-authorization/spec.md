## ADDED Requirements

### Requirement: Terminal authorization records require lifecycle reasons
The system SHALL reject parsed `denied`, `revoked`, `terminated`, and `expired` authorization records that omit `reason` before any remote action authorization check, runtime workflow, adapter, or audit consumer can treat the record as trusted lifecycle evidence. Terminal record reasons MUST use the existing canonical authorization reason validation so they remain non-blank, trimmed, bounded, format-safe, and secret-safe. Non-terminal authorization records MAY remain valid without reasons when all other consent, visibility, expiration, and permission-scope requirements pass.

#### Scenario: Denied record omits reason
- **WHEN** a parsed `denied` authorization record omits `reason`
- **THEN** the schema rejects the record before it can be used for remote action authorization or lifecycle evidence
- **AND** the rejection MUST NOT approve a session, grant permissions, activate host visibility, start capture, send input, reconnect peers, or bypass consent workflows

#### Scenario: Post-activation terminal record omits reason
- **WHEN** a parsed `revoked`, `terminated`, or post-activation `expired` authorization record omits `reason`
- **THEN** the schema rejects the record before it can be used for remote action authorization or lifecycle evidence
- **AND** the rejection MUST NOT approve a session, grant permissions, activate hidden host state, start capture, send input, reconnect peers, or bypass consent workflows

#### Scenario: Pre-access expired record omits reason
- **WHEN** a parsed non-activated `expired` authorization record omits `reason`
- **THEN** the schema rejects the record before it can be used for remote action authorization or lifecycle evidence
- **AND** remote action checks remain denied

#### Scenario: Terminal reason remains canonical
- **WHEN** a parsed terminal authorization record includes a blank, untrimmed, oversized, format-control, control-character, or secret-bearing reason
- **THEN** the schema rejects the record using the existing canonical reason validation
- **AND** diagnostics MUST NOT expose raw private reason text

#### Scenario: Terminal record includes valid reason
- **WHEN** a parsed `denied`, `revoked`, `terminated`, or `expired` authorization record includes a valid reason and satisfies all other terminal lifecycle invariants
- **THEN** the schema accepts the fail-closed terminal record
- **AND** remote action checks remain denied

#### Scenario: Non-terminal record omits reason
- **WHEN** a parsed pending, approved, active, or paused authorization record omits `reason` and satisfies all other lifecycle invariants
- **THEN** the schema accepts the non-terminal record
- **AND** the existing consent, host visibility, expiration, permission scope, revocation, pause, resume, and termination checks continue to apply
