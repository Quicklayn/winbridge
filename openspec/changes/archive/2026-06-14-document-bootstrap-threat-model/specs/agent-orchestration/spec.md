## MODIFIED Requirements

### Requirement: Release documentation gate
The repository SHALL maintain release readiness, threat-model, and privacy/data-handling documentation before publishing release candidates. The release documentation MUST cover consent, host visibility, host revoke/disconnect paths, authentication or authorization status, audit expectations, data handling, installer/startup/service behavior, known non-capabilities, verification commands, and security review gates. The threat model MUST cover current bootstrap scope, assets, trust boundaries, abuse cases or threats, current controls, prohibited capabilities, and future review gates. The privacy/data-handling documentation MUST NOT claim that capture, input, unattended access, production deployment, telemetry, account identity, installer, startup, service, or native Windows behavior exists until those capabilities are implemented through OpenSpec changes and reviewed.

#### Scenario: Release candidate references release documentation
- **WHEN** a release candidate is prepared
- **THEN** maintainers can find a release checklist, bootstrap threat model, and privacy/data-handling notice in repository documentation
- **AND** the checklist includes consent, visibility, revoke/disconnect, auth or authorization, audit, data handling, threat-model review, installer/startup/service, verification, and security review items

#### Scenario: Bootstrap threat model stays scoped
- **WHEN** the current bootstrap security documentation is reviewed
- **THEN** it states that screen capture, input injection, unattended access, production deployment, native Windows clients, installer behavior, startup persistence, services, telemetry, and production accounts are not implemented
- **AND** it documents current assets, trust boundaries, abuse cases or threats, current controls, prohibited capabilities, and future review gates without claiming production threat coverage

#### Scenario: Bootstrap privacy notice stays scoped
- **WHEN** the current bootstrap release documentation is reviewed
- **THEN** it states that screen capture, input injection, unattended access, production deployment, native Windows clients, installer behavior, startup persistence, services, telemetry, and production accounts are not implemented
- **AND** it documents current local development data handling without claiming production privacy guarantees

#### Scenario: Pull request template preserves release gate visibility
- **WHEN** maintainers prepare a pull request that may affect release readiness or user-facing behavior
- **THEN** the repository pull request template references the release checklist or release documentation gate
- **AND** it keeps the existing OpenSpec, safety, security review, and verification checklist expectations visible

#### Scenario: Security policy points reviewers to the threat model
- **WHEN** a change touches consent, visibility, authorization, relay routing, audit logging, diagnostics, installer, startup, service, privilege, native Windows APIs, or data handling
- **THEN** repository security documentation directs reviewers to inspect and update the bootstrap threat model as needed before release
- **AND** that review MUST NOT approve hidden sessions, stealth installation, unauthorized persistence, credential theft, keylogging, AV/EDR evasion, Windows prompt bypass, hidden capture, or hidden input
