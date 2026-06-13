## ADDED Requirements

### Requirement: Permission vocabulary excludes covert and high-risk administrative scopes
The system SHALL keep covert permission names and high-risk administrative or native permission names out of the current remote-assistance authorization vocabulary. Permission names implying hidden sessions, stealth installation, unauthorized persistence, credential access or theft, keylogging, AV/EDR evasion, Windows prompt bypass, remote shell, unattended access, service installation, startup persistence, privilege elevation, installer behavior, or native Windows administration MUST be rejected unless a future OpenSpec change and security review explicitly define a legitimate consent-first capability; permanently prohibited covert, credential theft, keylogging, evasion, and prompt-bypass capabilities MUST remain rejected.

#### Scenario: Covert permission shape is rejected
- **WHEN** a viewer, host, protocol message, or authorization record attempts to use a permission name shaped like hidden access, stealth, credential access, keylogging, evasion, or prompt bypass
- **THEN** the system rejects the permission before creating, granting, forwarding, restoring, revoking, or authorizing access

#### Scenario: High-risk administrative permission shape requires future review
- **WHEN** a viewer, host, protocol message, or authorization record attempts to use a permission name shaped like remote shell, unattended access, service installation, startup persistence, installer behavior, privilege elevation, or native Windows administration before an explicit approved OpenSpec change exists
- **THEN** the system rejects the permission before creating, granting, forwarding, restoring, revoking, or authorizing access
