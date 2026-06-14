## MODIFIED Requirements

### Requirement: Viewer control prompt local commands
The interactive viewer control prompt SHALL accept only exact `status` and `disconnect` command lines. The `status` command MUST print the existing bounded viewer status snapshot, including optional authorization expiration metadata while active or paused, and MUST NOT invoke lifecycle controls or public sends. The `disconnect` command MUST stop only the local viewer runtime and MUST NOT construct or send `peer-disconnected`, lifecycle, signal, control, or workflow audit messages. Malformed commands MUST be rejected without echoing raw command text.

#### Scenario: Viewer control prompt prints status
- **WHEN** viewer control prompt mode receives exact command `status`
- **THEN** it prints bounded local viewer status metadata with state, visible flag, permission count, optional authorization id/status, optional authorization expiration timestamp for active or paused authorization, optional relay-defined remote disconnect reason code after trusted remote host disconnect, and optional local inactive cause after explicit viewer local leave or local viewer socket close
- **AND** it does not invoke host lifecycle controls, viewer local disconnect, or public runtime sends

#### Scenario: Viewer control prompt disconnects locally
- **WHEN** viewer control prompt mode receives exact command `disconnect`
- **THEN** it stops the local viewer runtime
- **AND** it MUST NOT emit authorization, lifecycle, signal, control, `peer-disconnected`, or workflow audit messages because of the command

#### Scenario: Viewer control prompt rejects malformed commands
- **WHEN** viewer control prompt mode receives whitespace-padded, case-varied, suffixed, or unknown command input
- **THEN** it rejects the command before reading runtime status, stopping the runtime, invoking host lifecycle controls, or sending protocol messages
- **AND** prompt output MUST NOT echo the raw command line

#### Scenario: Viewer control prompt safety boundary
- **WHEN** viewer control prompt mode starts, accepts a command, rejects a command, fails, or stops
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, invoke host controls, suppress host visibility, or bypass consent workflows
