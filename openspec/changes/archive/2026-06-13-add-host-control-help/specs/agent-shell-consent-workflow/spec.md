## ADDED Requirements

### Requirement: Host control prompt help command
The interactive host control prompt SHALL support an exact read-only `help` command. The help command MUST print only a bounded static list of accepted host control prompt commands and MUST NOT call runtime status snapshots, pause, resume, revoke, terminate, disconnect, viewer leave, public send, or any direct protocol-construction path. Help output MUST remain secret-safe and MUST NOT echo raw command lines, permission names beyond the literal documented placeholder and example, peer ids, display names, private reasons, protocol payloads, tokens, pairing codes, signal payloads, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, or input contents.

#### Scenario: Host control prompt prints help
- **WHEN** host control prompt mode receives exact command `help`
- **THEN** it prints a bounded static help line listing exact accepted commands
- **AND** it does not read runtime status, invoke host lifecycle controls, invoke viewer leave, or call public runtime sends

#### Scenario: Host control prompt rejects malformed help commands
- **WHEN** host control prompt mode receives whitespace-padded, case-varied, or suffixed help input
- **THEN** it rejects the command before reading runtime status, invoking any managed runtime control, invoking viewer leave, or sending protocol messages
- **AND** prompt output MUST NOT echo the raw command line

#### Scenario: Host help command safety boundary
- **WHEN** host help command starts, succeeds, fails, or is rejected
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, or bypass consent workflows
