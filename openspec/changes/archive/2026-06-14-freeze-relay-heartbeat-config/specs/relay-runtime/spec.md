## MODIFIED Requirements

### Requirement: Testable heartbeat configuration
The relay runtime SHALL allow tests to disable heartbeat handling or inject safe heartbeat interval and timeout values while preserving the same validation and snapshot semantics as relay heartbeat configuration.

#### Scenario: Runtime disables heartbeat for deterministic tests
- **WHEN** `createRelayRuntime({ heartbeat: false })` is used
- **THEN** accepted peers do not receive relay heartbeat timers

#### Scenario: Runtime rejects unsafe injected heartbeat configuration
- **WHEN** `createRelayRuntime({ heartbeat })` receives malformed, zero, fractional, non-finite, or timer-unsafe heartbeat interval or timeout values
- **THEN** runtime creation rejects the settings before accepting peer connections

#### Scenario: Runtime snapshots injected heartbeat configuration
- **WHEN** `createRelayRuntime({ heartbeat })` receives a safe heartbeat config and caller code mutates that original object before peers connect
- **THEN** accepted peers use the validated snapshot captured during runtime creation
- **AND** the later mutation MUST NOT change stale-peer timeout behavior or create unsafe timers
