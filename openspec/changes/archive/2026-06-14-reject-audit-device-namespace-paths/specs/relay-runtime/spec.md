## MODIFIED Requirements

### Requirement: Relay audit path runtime validation
The relay runtime SHALL reject configured development audit log paths that are empty, whitespace-only, untrimmed, exceed 1024 UTF-8 bytes, contain ASCII control characters, contain Unicode bidirectional formatting controls, contain zero-width formatting controls, contain Windows reserved device path segments, contain Windows alternate data stream path segments, or start with Windows device namespace prefixes before selecting a file audit sink, opening a listener, or accepting peer connections. Alternate data stream detection MUST allow an initial Windows drive prefix segment such as `C:` while rejecting colon-bearing path segments after that prefix. Device namespace detection MUST reject `\\.\`, `\\?\`, `//./`, and `//?/` prefixes.

#### Scenario: Relay audit path contains format controls
- **WHEN** the relay is configured with a `WINBRIDGE_RELAY_AUDIT_LOG_PATH` value containing a Unicode bidirectional or zero-width formatting control
- **THEN** relay startup fails before selecting a file audit sink, opening a listener, or accepting peer connections
- **AND** startup diagnostics MUST NOT include the raw configured path value

#### Scenario: Relay audit path targets reserved device
- **WHEN** the relay is configured with a `WINBRIDGE_RELAY_AUDIT_LOG_PATH` value targeting a Windows reserved device path segment
- **THEN** relay startup fails before selecting a file audit sink, opening a listener, or accepting peer connections
- **AND** startup diagnostics MUST NOT include the raw configured path value

#### Scenario: Relay audit path targets alternate data stream
- **WHEN** the relay is configured with a `WINBRIDGE_RELAY_AUDIT_LOG_PATH` value targeting a Windows alternate data stream path segment
- **THEN** relay startup fails before selecting a file audit sink, opening a listener, or accepting peer connections
- **AND** startup diagnostics MUST NOT include the raw configured path value

#### Scenario: Relay audit path uses Windows device namespace
- **WHEN** the relay is configured with a `WINBRIDGE_RELAY_AUDIT_LOG_PATH` value using a Windows device namespace prefix
- **THEN** relay startup fails before selecting a file audit sink, opening a listener, or accepting peer connections
- **AND** startup diagnostics MUST NOT include the raw configured path value

#### Scenario: Relay audit path uses ordinary Windows drive prefix
- **WHEN** the relay is configured with a `WINBRIDGE_RELAY_AUDIT_LOG_PATH` value such as `C:\logs\relay-audit.jsonl` or `D:/logs/relay-audit.jsonl`
- **THEN** relay audit path validation accepts the value when all other relay audit path requirements pass
