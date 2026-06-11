## ADDED Requirements

### Requirement: Non-blank authorization reasons
The system SHALL reject authorization lifecycle records and transitions that include blank or whitespace-only reason text.

#### Scenario: Denial reason is blank
- **WHEN** a host denial transition is attempted with a whitespace-only reason
- **THEN** the authorization state machine rejects the transition before recording denied state

#### Scenario: Termination reason is blank
- **WHEN** a session termination transition is attempted with a whitespace-only reason
- **THEN** the authorization state machine rejects the transition before recording terminated state

#### Scenario: Optional lifecycle reason is blank
- **WHEN** a revocation, pause, or resume transition includes a whitespace-only optional reason
- **THEN** the authorization state machine rejects the transition instead of storing meaningless audit metadata

#### Scenario: Parsed authorization record has blank reason
- **WHEN** an authorization record includes a whitespace-only reason
- **THEN** the authorization schema rejects the record before action authorization can use it

#### Scenario: Optional lifecycle reason is omitted
- **WHEN** a transition omits an optional reason and the state machine has a safe default reason
- **THEN** the transition remains valid and records the default reason
