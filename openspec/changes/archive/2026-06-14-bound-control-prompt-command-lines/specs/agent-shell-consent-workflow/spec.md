## ADDED Requirements

### Requirement: Control prompt command line length bounds
The interactive host and viewer control prompts SHALL reject any complete local command line whose UTF-8 byte length is greater than the implementation-defined maximum before parsing the command or invoking runtime operations. The maximum MUST be finite and no greater than 256 bytes. Oversized command rejection MUST use generic secret-safe prompt output and MUST NOT echo raw command text, byte contents, tokens, pairing codes, private reasons, peer ids, display names, protocol payloads, signal payloads, keystrokes, screenshots, screen contents, input contents, clipboard contents, file-transfer contents, diagnostics dumps, raw WebSocket close reason text, or raw runtime exception text.

#### Scenario: Host control prompt rejects oversized command lines
- **WHEN** host control prompt mode receives a complete command line whose UTF-8 byte length is greater than the control prompt maximum
- **THEN** it rejects the command before parsing permissions, reading host status, invoking pause, resume, revoke, terminate, disconnect, or public runtime sends
- **AND** it MUST NOT send session-control, permission-revoked, authorization-state, disconnect, signal, `peer-disconnected`, or workflow audit messages because of that command
- **AND** prompt output MUST NOT echo the raw command line or expose its byte contents

#### Scenario: Viewer control prompt rejects oversized command lines
- **WHEN** viewer control prompt mode receives a complete command line whose UTF-8 byte length is greater than the control prompt maximum
- **THEN** it rejects the command before reading viewer status, stopping the local viewer runtime, invoking host lifecycle controls, or sending public runtime messages
- **AND** it MUST NOT send authorization, lifecycle, signal, control, `peer-disconnected`, or workflow audit messages because of that command
- **AND** prompt output MUST NOT echo the raw command line or expose its byte contents
