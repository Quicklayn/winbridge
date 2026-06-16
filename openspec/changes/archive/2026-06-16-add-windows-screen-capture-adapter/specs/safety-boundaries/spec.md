## ADDED Requirements

### Requirement: Reviewed native screen capture remains visible and consent-bound

The system SHALL allow native screen capture only for a reviewed visible-session
remote assistance capability that requires explicit host consent, active
`screen:view` authorization, visible host indication, immediate host revocation,
and metadata-safe diagnostics. Hidden capture remains prohibited.

#### Scenario: Reviewed visible capture is allowed
- **WHEN** a native capture capability has an explicit OpenSpec change, active visible host consent, `screen:view` authorization, revocation controls, and metadata-safe diagnostics
- **THEN** the implementation may capture screen frames only within that active visible authorization scope

#### Scenario: Hidden or unauthorized capture is requested
- **WHEN** a requested capture path runs without explicit host approval, visible host indication, active `screen:view` authorization, or immediate host revocation
- **THEN** the feature is rejected before capture, protocol forwarding, persistence, service behavior, startup persistence, elevation, or prompt bypass
