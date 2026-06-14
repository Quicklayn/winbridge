## ADDED Requirements

### Requirement: Windows device namespace audit paths are rejected
The system SHALL reject configured file audit paths that start with Windows device namespace prefixes before writing audit records or falling back to non-file audit behavior. Device namespace detection MUST reject `\\.\`, `\\?\`, `//./`, and `//?/` prefixes. Rejection diagnostics MUST NOT include the raw configured path.

#### Scenario: File sink path uses Windows device namespace
- **WHEN** a file audit sink is constructed with a path such as `\\.\NUL`, `\\.\pipe\audit`, `\\?\C:\logs\audit.jsonl`, or `//?/C:/logs/audit.jsonl`
- **THEN** construction fails before any audit record is written
- **AND** the failure MUST NOT expose the raw configured path value

#### Scenario: Relay audit path uses Windows device namespace
- **WHEN** the relay is configured with `WINBRIDGE_RELAY_AUDIT_LOG_PATH` using a Windows device namespace prefix
- **THEN** relay startup fails before selecting console audit fallback or accepting peer connections
- **AND** the failure MUST NOT expose the raw configured path value

#### Scenario: Agent audit path uses Windows device namespace
- **WHEN** the agent shell is configured with `WINBRIDGE_AGENT_AUDIT_LOG_PATH` or `--audit-log` using a Windows device namespace prefix
- **THEN** argument parsing fails before starting the runtime or connecting to the relay
- **AND** the failure MUST NOT expose the raw configured path value

#### Scenario: Ordinary audit path remains valid
- **WHEN** a file audit sink is constructed with a safe ordinary path such as `logs/audit.jsonl`, `C:\logs\audit.jsonl`, or `D:/logs/audit.jsonl`
- **THEN** path validation accepts the value when all other audit path requirements pass
