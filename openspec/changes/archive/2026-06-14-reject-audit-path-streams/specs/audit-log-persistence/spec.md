## ADDED Requirements

### Requirement: Windows stream audit paths are rejected
The system SHALL reject configured file audit paths whose path segments contain Windows alternate data stream syntax before writing audit records or falling back to non-file audit behavior. Alternate data stream detection MUST reject colon-bearing path segments except for an initial Windows drive prefix segment such as `C:`. Rejection diagnostics MUST NOT include the raw configured path.

#### Scenario: File sink path targets alternate data stream
- **WHEN** a file audit sink is constructed with a path such as `logs/audit.jsonl:hidden`, `logs\audit.jsonl:hidden`, `audit.jsonl:$DATA`, or `C:\audit\events.jsonl:hidden`
- **THEN** construction fails before any audit record is written
- **AND** the failure MUST NOT expose the raw configured path value

#### Scenario: Relay audit path targets alternate data stream
- **WHEN** the relay is configured with `WINBRIDGE_RELAY_AUDIT_LOG_PATH` targeting a Windows alternate data stream path segment
- **THEN** relay startup fails before selecting console audit fallback or accepting peer connections
- **AND** the failure MUST NOT expose the raw configured path value

#### Scenario: Agent audit path targets alternate data stream
- **WHEN** the agent shell is configured with `WINBRIDGE_AGENT_AUDIT_LOG_PATH` or `--audit-log` targeting a Windows alternate data stream path segment
- **THEN** argument parsing fails before starting the runtime or connecting to the relay
- **AND** the failure MUST NOT expose the raw configured path value

#### Scenario: Windows drive audit path remains valid
- **WHEN** a file audit sink is constructed with a safe Windows drive path such as `C:\logs\audit.jsonl` or `D:/logs/audit.jsonl`
- **THEN** path validation accepts the value when all other audit path requirements pass
