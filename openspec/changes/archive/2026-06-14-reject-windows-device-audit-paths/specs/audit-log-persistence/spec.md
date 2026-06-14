## ADDED Requirements

### Requirement: Windows device audit paths are rejected
The system SHALL reject configured file audit paths whose path segments resolve to Windows reserved device names before writing audit records or falling back to non-file audit behavior. Reserved audit path detection MUST include `CON`, `CONIN$`, `CONOUT$`, `PRN`, `AUX`, `NUL`, `COM1` through `COM9`, and `LPT1` through `LPT9`, including those names when followed by an extension. Rejection diagnostics MUST NOT include the raw configured path.

#### Scenario: File sink path targets reserved device
- **WHEN** a file audit sink is constructed with a path such as `NUL`, `CON.txt`, `logs/NUL.jsonl`, `logs\COM1.log`, or `C:\audit\LPT1`
- **THEN** construction fails before any audit record is written
- **AND** the failure MUST NOT expose the raw configured path value

#### Scenario: Relay audit path targets reserved device
- **WHEN** the relay is configured with `WINBRIDGE_RELAY_AUDIT_LOG_PATH` targeting a Windows reserved device path segment
- **THEN** relay startup fails before selecting console audit fallback or accepting peer connections
- **AND** the failure MUST NOT expose the raw configured path value

#### Scenario: Agent audit path targets reserved device
- **WHEN** the agent shell is configured with `WINBRIDGE_AGENT_AUDIT_LOG_PATH` or `--audit-log` targeting a Windows reserved device path segment
- **THEN** argument parsing fails before starting the runtime or connecting to the relay
- **AND** the failure MUST NOT expose the raw configured path value

#### Scenario: Safe lookalike audit path remains valid
- **WHEN** a file audit sink is constructed with a safe lookalike path such as `logs/null-audit.jsonl`, `logs/com10.jsonl`, or `logs/lpt10.jsonl`
- **THEN** path validation accepts the value when all other audit path requirements pass
