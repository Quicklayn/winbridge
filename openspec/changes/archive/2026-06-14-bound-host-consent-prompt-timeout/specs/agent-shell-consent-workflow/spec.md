## ADDED Requirements

### Requirement: Direct host consent prompt timeout is bounded
The agent shell SHALL reject malformed direct interactive host consent prompt timeout values before creating prompt timers or rendering host-facing prompt text. Direct prompt timeout values MUST be finite integer millisecond values from `1` through the safe timer delay bound when supplied. Rejection MUST happen before reading host input, writing prompt output, sending authorization decisions, sending authorization state, sending workflow audit events, activating host visibility, granting permissions, starting capture, sending input, or bypassing consent workflows.

#### Scenario: Prompt helper rejects malformed timeout
- **WHEN** local code calls the interactive host consent prompt helper with a zero, negative, fractional, non-finite, `NaN`, or timer-unsafe timeout value
- **THEN** the helper rejects the request before creating the prompt timer
- **AND** the rejection MUST NOT render viewer identity, requested permissions, request reason, prompt instructions, authorization decisions, authorization state, workflow audit events, or host visibility changes

#### Scenario: Provider factory rejects malformed timeout
- **WHEN** local code creates an interactive host decision provider with a zero, negative, fractional, non-finite, `NaN`, or timer-unsafe timeout value
- **THEN** provider creation rejects the request before a provider can be used for host approval
- **AND** the rejection MUST NOT approve a session, grant permissions, activate host visibility, start capture, send input, or bypass consent workflows

#### Scenario: Omitted and valid timeout behavior remains supported
- **WHEN** local code omits the prompt timeout or supplies a valid positive bounded timeout
- **THEN** the existing prompt timeout and exact `approve` or `deny` handling remains unchanged
- **AND** valid timeout handling MUST NOT grant permissions without explicit host approval, activate invisible sessions, suppress revocation, or bypass consent workflows
