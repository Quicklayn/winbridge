## MODIFIED Requirements

### Requirement: Canonical authorization reasons
The system SHALL reject authorization lifecycle records and transitions that include blank, whitespace-only, oversized, untrimmed, ASCII control-character, or Unicode bidirectional or zero-width formatting-control reason text, including `U+FEFF`. Rejection MUST occur before storing the updated authorization record or using it for action authorization, and MUST NOT create or restore access.

#### Scenario: Denial reason is blank
- **WHEN** a host denial transition is attempted with a whitespace-only reason
- **THEN** the authorization state machine rejects the transition before recording denied state

#### Scenario: Denial reason is untrimmed
- **WHEN** a host denial transition is attempted with a reason containing leading or trailing whitespace
- **THEN** the authorization state machine rejects the transition before recording denied state

#### Scenario: Denial reason contains ASCII control characters
- **WHEN** a host denial transition is attempted with a reason containing an ASCII control character
- **THEN** the authorization state machine rejects the transition before recording denied state

#### Scenario: Denial reason contains Unicode formatting controls
- **WHEN** a host denial transition is attempted with a reason containing a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the authorization state machine rejects the transition before recording denied state

#### Scenario: Termination reason is blank
- **WHEN** a session termination transition is attempted with a whitespace-only reason
- **THEN** the authorization state machine rejects the transition before recording terminated state

#### Scenario: Termination reason is untrimmed
- **WHEN** a session termination transition is attempted with a reason containing leading or trailing whitespace
- **THEN** the authorization state machine rejects the transition before recording terminated state

#### Scenario: Termination reason contains ASCII control characters
- **WHEN** a session termination transition is attempted with a reason containing an ASCII control character
- **THEN** the authorization state machine rejects the transition before recording terminated state

#### Scenario: Termination reason contains Unicode formatting controls
- **WHEN** a session termination transition is attempted with a reason containing a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the authorization state machine rejects the transition before recording terminated state

#### Scenario: Optional lifecycle reason is blank
- **WHEN** a revocation, pause, or resume transition includes a whitespace-only optional reason
- **THEN** the authorization state machine rejects the transition instead of storing meaningless audit metadata

#### Scenario: Optional lifecycle reason is untrimmed
- **WHEN** a revocation, pause, or resume transition includes a reason containing leading or trailing whitespace
- **THEN** the authorization state machine rejects the transition instead of storing ambiguous audit metadata

#### Scenario: Optional lifecycle reason contains ASCII control characters
- **WHEN** a revocation, pause, or resume transition includes a reason containing an ASCII control character
- **THEN** the authorization state machine rejects the transition instead of storing ambiguous audit metadata

#### Scenario: Optional lifecycle reason contains Unicode formatting controls
- **WHEN** a revocation, pause, or resume transition includes a reason containing a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the authorization state machine rejects the transition instead of storing ambiguous audit metadata

#### Scenario: Parsed authorization record has blank reason
- **WHEN** an authorization record includes a whitespace-only reason
- **THEN** the authorization schema rejects the record before action authorization can use it

#### Scenario: Parsed authorization record has untrimmed reason
- **WHEN** an authorization record includes a reason containing leading or trailing whitespace
- **THEN** the authorization schema rejects the record before action authorization can use it

#### Scenario: Parsed authorization record reason contains ASCII control characters
- **WHEN** an authorization record includes a reason containing an ASCII control character
- **THEN** the authorization schema rejects the record before action authorization can use it

#### Scenario: Parsed authorization record reason contains Unicode formatting controls
- **WHEN** an authorization record includes a reason containing a Unicode bidirectional or zero-width formatting control including `U+FEFF`
- **THEN** the authorization schema rejects the record before action authorization can use it

#### Scenario: Reason rejection is fail-closed and secret-safe
- **WHEN** authorization reason validation rejects a malformed transition or parsed record
- **THEN** the rejection MUST NOT approve a session, activate host visibility, grant permissions, start capture, send input, reconnect a peer, suppress visibility, or bypass consent workflows
- **AND** diagnostics MUST NOT expose raw private reason text

#### Scenario: Optional lifecycle reason is omitted
- **WHEN** a transition omits an optional reason and the state machine has a safe default reason
- **THEN** the transition remains valid and records the default reason
