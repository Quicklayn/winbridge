## MODIFIED Requirements

### Requirement: Configurable relay heartbeat
The relay SHALL support development heartbeat configuration for WebSocket peer liveness checks with safe default interval and timeout values, and SHALL reject malformed or unsafe heartbeat enabled flag, interval, or timeout configuration before accepting peers. Injected heartbeat timer configuration accepted by the relay SHALL be copied into a validated internal snapshot before use, so caller-owned object mutation after validation cannot change heartbeat interval or timeout behavior.

#### Scenario: Heartbeat environment omitted
- **WHEN** the relay starts without heartbeat environment variables
- **THEN** the relay uses development heartbeat defaults and enables liveness checks

#### Scenario: Heartbeat enabled flag is canonical
- **WHEN** the relay starts with `WINBRIDGE_RELAY_HEARTBEAT_ENABLED` set to `true`, `false`, `yes`, `no`, `1`, or `0`
- **THEN** the relay accepts the flag value and applies the matching heartbeat enabled state

#### Scenario: Heartbeat enabled flag is malformed
- **WHEN** the relay is configured with an empty, whitespace-only, untrimmed, case-variant, or unknown `WINBRIDGE_RELAY_HEARTBEAT_ENABLED` value
- **THEN** the relay rejects configuration before accepting peer connections or scheduling heartbeat timers

#### Scenario: Heartbeat disabled for a test runtime
- **WHEN** a test creates a managed relay runtime with heartbeat disabled
- **THEN** the relay does not create peer heartbeat timers for that runtime

#### Scenario: Heartbeat timer environment is malformed
- **WHEN** the relay is configured with empty, partial, fractional, negative, zero, or timer-unsafe heartbeat interval or timeout environment values
- **THEN** the relay rejects configuration before accepting peer connections or scheduling heartbeat timers

#### Scenario: Injected heartbeat config is mutated after validation
- **WHEN** caller code mutates an injected heartbeat configuration object after relay heartbeat validation
- **THEN** the relay continues using the validated interval and timeout snapshot
- **AND** the mutation MUST NOT create unsafe timers, approve sessions, grant permissions, start capture, send input, suppress host visibility, or bypass consent workflows
