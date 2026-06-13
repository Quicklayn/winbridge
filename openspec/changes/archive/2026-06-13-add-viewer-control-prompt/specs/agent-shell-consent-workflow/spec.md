## ADDED Requirements

### Requirement: Viewer control prompt CLI validation
The agent shell SHALL support an opt-in `--viewer-control-prompt true|false` CLI flag for viewer runtimes. Viewer control prompt configuration MUST be rejected before runtime startup when it is malformed, supplied for a host runtime, or enabled together with one-shot viewer status or viewer local disconnect timers. Viewer control prompt configuration MUST NOT require requested permissions or active authorization because it only reads local viewer status or stops the local viewer runtime.

#### Scenario: Viewer control prompt is accepted for viewer runtimes
- **WHEN** a viewer shell is started with `--viewer-control-prompt true`
- **THEN** CLI validation succeeds and the runtime MAY start normally
- **AND** the prompt does not require `--request`

#### Scenario: Viewer control prompt is rejected for host runtimes
- **WHEN** a host shell is started with `--viewer-control-prompt true`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Viewer control prompt rejects ambiguous one-shot helpers
- **WHEN** a viewer shell is started with `--viewer-control-prompt true` and either `--viewer-status-after-ms` or `--viewer-disconnect-after-ms`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

### Requirement: Viewer control prompt local commands
The interactive viewer control prompt SHALL accept only exact `status` and `disconnect` command lines. The `status` command MUST print the existing bounded viewer status snapshot and MUST NOT invoke lifecycle controls or public sends. The `disconnect` command MUST stop only the local viewer runtime and MUST NOT construct or send `peer-disconnected`, lifecycle, signal, control, or workflow audit messages. Malformed commands MUST be rejected without echoing raw command text.

#### Scenario: Viewer control prompt prints status
- **WHEN** viewer control prompt mode receives exact command `status`
- **THEN** it prints bounded local viewer status metadata with state, visible flag, permission count, and optional authorization id/status
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
