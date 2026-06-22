## MODIFIED Requirements

### Requirement: Viewer control prompt CLI validation
The agent shell SHALL support an opt-in `--viewer-control-prompt true|false` CLI flag for viewer runtimes. Viewer control prompt configuration MUST be rejected before runtime startup when it is malformed, supplied for a host runtime, or enabled together with one-shot viewer status or viewer local disconnect timers. Viewer control prompt configuration MUST NOT require requested permissions or active authorization at startup because `help`, `status`, and `disconnect` remain valid local commands without input permission. Input commands entered after startup MUST fail closed at command time unless the viewer currently has active visible authorization with the required `input:pointer` or `input:keyboard` permission.

#### Scenario: Viewer control prompt is accepted for viewer runtimes
- **WHEN** a viewer shell is started with `--viewer-control-prompt true`
- **THEN** CLI validation succeeds and the runtime MAY start normally
- **AND** the prompt does not require `--request` at startup

#### Scenario: Viewer control prompt is rejected for host runtimes
- **WHEN** a host shell is started with `--viewer-control-prompt true`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Viewer control prompt rejects ambiguous one-shot helpers
- **WHEN** a viewer shell is started with `--viewer-control-prompt true` and either `--viewer-status-after-ms` or `--viewer-disconnect-after-ms`
- **THEN** it exits through bounded usage handling before connecting to the relay or sending any protocol message

#### Scenario: Viewer control prompt input command lacks authorization
- **WHEN** viewer control prompt mode receives an input command before the viewer has active visible authorization with the matching input permission
- **THEN** the command fails closed before local sent event emission, socket write, host input application, native adapter calls, reconnection, hidden session behavior, or consent bypass
- **AND** prompt output MUST remain metadata-only and MUST NOT echo the raw command line

### Requirement: Viewer control prompt local commands
The interactive viewer control prompt SHALL accept only exact `status`, `disconnect`, and bounded one-event input command lines. The `status` command MUST print the existing bounded viewer status snapshot, including optional authorization expiration metadata while active or paused, and MUST NOT invoke lifecycle controls or public sends. The `disconnect` command MUST stop only the local viewer runtime and MUST NOT construct or send `peer-disconnected`, lifecycle, signal, control, input, or workflow audit messages. Input commands MUST represent exactly one protocol-supported pointer or keyboard event and MUST send it only through the managed runtime `sendInputEvent()` path after reading current viewer status with an active visible authorization id. Malformed commands MUST be rejected without echoing raw command text.

Accepted input command forms are:

- `pointer-move <x> <y>`
- `pointer-down <x> <y> <primary|secondary|middle|back|forward>`
- `pointer-up <x> <y> <primary|secondary|middle|back|forward>`
- `pointer-wheel <x> <y> <deltaX> <deltaY>`
- `key-down <KeyName> [alt,control,meta,shift]`
- `key-up <KeyName> [alt,control,meta,shift]`

Pointer coordinates MUST be finite normalized decimal values from `0` through `1`. Wheel deltas MUST be exact bounded integers and at least one delta MUST be non-zero. Keyboard names MUST be supported protocol key names, and modifiers MUST be unique exact comma-separated modifier tokens. The prompt MUST NOT accept free-form text buffers, paste payloads, command macros, raw JSON, or repeated-key capture.

#### Scenario: Viewer control prompt prints status
- **WHEN** viewer control prompt mode receives exact command `status`
- **THEN** it prints bounded local viewer status metadata with state, visible flag, permission count, optional authorization id/status, optional authorization expiration timestamp for active or paused authorization, optional relay-defined remote disconnect reason code after trusted remote host disconnect, and optional local inactive cause after explicit viewer local leave or local viewer socket close
- **AND** it does not invoke host lifecycle controls, viewer local disconnect, or public runtime sends

#### Scenario: Viewer control prompt disconnects locally
- **WHEN** viewer control prompt mode receives exact command `disconnect`
- **THEN** it stops the local viewer runtime
- **AND** it MUST NOT emit authorization, lifecycle, signal, control, input, `peer-disconnected`, or workflow audit messages because of the command

#### Scenario: Viewer control prompt sends pointer input
- **WHEN** viewer control prompt mode receives an exact pointer input command while the current viewer status is active and visible with an authorization id that grants `input:pointer`
- **THEN** it invokes the managed runtime input send path with one pointer event bound to that authorization id
- **AND** the runtime's existing routing, permission, socket, disconnect, audit-before-send, and redaction gates remain authoritative
- **AND** prompt output MUST NOT expose pointer coordinates, button values, raw command text, tokens, pairing codes, credentials, private reasons, or full secrets

#### Scenario: Viewer control prompt sends keyboard input
- **WHEN** viewer control prompt mode receives an exact keyboard input command while the current viewer status is active and visible with an authorization id that grants `input:keyboard`
- **THEN** it invokes the managed runtime input send path with one keyboard event bound to that authorization id
- **AND** the runtime's existing routing, permission, socket, disconnect, audit-before-send, and redaction gates remain authoritative
- **AND** prompt output MUST NOT expose key values, modifier values, raw command text, keylogging buffers, tokens, pairing codes, credentials, private reasons, or full secrets

#### Scenario: Viewer control prompt rejects malformed commands
- **WHEN** viewer control prompt mode receives whitespace-padded, case-varied, suffixed, unknown, unsupported-button, duplicate-modifier, unsafe-coordinate, unsafe-delta, free-form-text, macro-shaped, or raw-JSON command input
- **THEN** it rejects the command before reading runtime status, stopping the runtime, invoking host lifecycle controls, sending input, or sending protocol messages
- **AND** prompt output MUST NOT echo the raw command line

#### Scenario: Viewer control prompt input send fails
- **WHEN** viewer control prompt mode receives a syntactically valid input command but runtime authorization, routing, socket, disconnect, audit, or send gates reject it
- **THEN** the prompt reports only sanitized bounded failure metadata and continues accepting later valid commands
- **AND** it MUST NOT expose pointer coordinates, button values, key values, modifier values, raw command text, keylogging buffers, tokens, pairing codes, credentials, private reasons, command output, or full secrets

#### Scenario: Viewer control prompt safety boundary
- **WHEN** viewer control prompt mode starts, accepts a command, rejects a command, fails, or stops
- **THEN** it MUST NOT capture keyboard input outside exact submitted command lines, start screen capture, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, invoke host controls, suppress host visibility, or bypass consent workflows
- **AND** input commands MUST NOT send more than one protocol input event per accepted command

### Requirement: Viewer control prompt help command
The interactive viewer control prompt SHALL support an exact read-only `help` command. The help command MUST print only a bounded static list of accepted viewer control prompt command forms and MUST NOT call runtime status snapshots, viewer leave, host lifecycle controls, input sends, public send, or any direct protocol-construction path. Help output MUST remain secret-safe and MUST NOT echo raw command lines, peer ids, display names, private reasons, protocol payloads, tokens, pairing codes, signal payloads, permission names, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents, diagnostics dumps, input contents, pointer coordinates, button values, key values, modifier values, or full secrets.

#### Scenario: Viewer control prompt prints help
- **WHEN** viewer control prompt mode receives exact command `help`
- **THEN** it prints a bounded static help line listing exact accepted command forms
- **AND** it does not read runtime status, invoke viewer leave, invoke host lifecycle controls, call input sends, or call public runtime sends

#### Scenario: Viewer control prompt rejects malformed help commands
- **WHEN** viewer control prompt mode receives whitespace-padded, case-varied, or suffixed help input
- **THEN** it rejects the command before reading runtime status, invoking viewer leave, invoking host lifecycle controls, sending input, or sending protocol messages
- **AND** prompt output MUST NOT echo the raw command line

#### Scenario: Viewer help command safety boundary
- **WHEN** viewer help command starts, succeeds, fails, or is rejected
- **THEN** it MUST NOT start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide the session from the host, reconnect peers, suppress host visibility, invoke host controls, or bypass consent workflows
