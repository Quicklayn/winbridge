## ADDED Requirements

### Requirement: Viewer control prompt help command
The interactive viewer control prompt SHALL support an exact read-only `help` command. The help command MUST print only a bounded static list of accepted viewer control prompt commands and MUST NOT call runtime status snapshots, viewer leave, host lifecycle controls, public send, or any direct protocol-construction path. Help output MUST remain secret-safe and MUST NOT echo raw command lines, peer ids, display names, private reasons, protocol payloads, tokens, pairing codes, signal payloads, permission names, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents.

#### Scenario: Viewer control prompt prints help
- **WHEN** viewer control prompt mode receives exact command `help`
- **THEN** it prints a bounded static help line listing exact accepted commands
- **AND** it does not read runtime status, invoke viewer leave, invoke host lifecycle controls, or call public runtime sends

#### Scenario: Viewer control prompt rejects malformed help commands
- **WHEN** viewer control prompt mode receives whitespace-padded, case-varied, or suffixed help input
- **THEN** it rejects the command before reading runtime status, invoking viewer leave, invoking host lifecycle controls, or sending protocol messages
- **AND** prompt output MUST NOT echo the raw command line

#### Scenario: Viewer help command safety boundary
- **WHEN** viewer help command starts, succeeds, fails, or is rejected
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, invoke host controls, or bypass consent workflows
