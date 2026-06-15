## ADDED Requirements

### Requirement: Agent shell CLI exercises consent-bound development screen frames

The agent shell CLI SHALL expose a host-only non-native development operation that schedules at most one `screen-frame` send through the dedicated runtime screen-frame method. The operation MUST validate all CLI frame inputs before runtime startup, wait for an active visible unexpired authorization that grants `screen:view`, and rely on the runtime method for final authorization, routing, audit-before-send, socket, and redaction gates.

#### Scenario: Host schedules a development screen frame
- **WHEN** a host CLI process is started with the development screen-frame option and later has active visible unexpired `screen:view` authorization
- **THEN** it sends one schema-valid `screen-frame` through the dedicated runtime screen-frame method
- **AND** the send path MUST write metadata-only accepted local audit before socket write
- **AND** CLI output, runtime events, logs, and audit records MUST NOT expose raw frame bytes, encoded frame data, screenshots, screen contents, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Host screen frame CLI fires after authorization loss
- **WHEN** a scheduled host development screen-frame send fires after authorization is paused, revoked, terminated, expired, invisible, missing, or no longer grants `screen:view`
- **THEN** it MUST fail closed before accepted-send audit, socket write, local sent event emission, capture side effects, rendering side effects, native adapter calls, reconnection, hidden session behavior, or consent bypass

#### Scenario: Screen frame CLI input is malformed
- **WHEN** a host CLI process is started with malformed development screen-frame configuration such as unsafe delay, unsupported format, invalid dimensions, malformed base64, oversized encoded data, unsafe frame id, or role-mismatched use
- **THEN** it exits through bounded usage handling before opening a relay connection, sending protocol messages, writing audit records, starting capture, rendering frames, invoking native adapters, or exposing the raw frame payload

### Requirement: Agent shell CLI exercises consent-bound development input events

The agent shell CLI SHALL expose a viewer-only non-native development operation that schedules at most one `input-event` send through the dedicated runtime input-event method. The operation MUST validate all CLI input-event fields before runtime startup, wait for active visible unexpired authorization that grants the required input permission, and rely on the runtime method for final authorization, routing, audit-before-send, socket, and redaction gates.

#### Scenario: Viewer schedules development pointer input
- **WHEN** a viewer CLI process is started with a development pointer input option and later observes active visible unexpired authorization that grants `input:pointer`
- **THEN** it sends one schema-valid pointer `input-event` through the dedicated runtime input-event method
- **AND** the send path MUST write metadata-only accepted local audit before socket write
- **AND** CLI output, runtime events, logs, and audit records MUST NOT expose pointer coordinates, button values, raw input payloads, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Viewer schedules development keyboard input
- **WHEN** a viewer CLI process is started with a development keyboard input option and later observes active visible unexpired authorization that grants `input:keyboard`
- **THEN** it sends one schema-valid keyboard `input-event` through the dedicated runtime input-event method
- **AND** the send path MUST write metadata-only accepted local audit before socket write
- **AND** CLI output, runtime events, logs, and audit records MUST NOT expose key values, code values, modifier values, raw input payloads, credentials, tokens, pairing codes, private reasons, keystroke buffers, or full secrets

#### Scenario: Viewer input CLI fires after authorization loss
- **WHEN** a scheduled viewer development input send fires after authorization is paused, revoked, terminated, expired, invisible, missing, or no longer grants the required input permission
- **THEN** it MUST fail closed before accepted-send audit, socket write, local sent event emission, host input side effects, native adapter calls, reconnection, hidden session behavior, or consent bypass

#### Scenario: Input CLI configuration is malformed
- **WHEN** a viewer CLI process is started with malformed development input configuration such as unsafe delay, unknown input kind, invalid pointer coordinate, invalid button, invalid key/code/modifier value, role-mismatched use, missing required input permission, or keylogging-buffer-shaped data
- **THEN** it exits through bounded usage handling before opening a relay connection, sending protocol messages, writing audit records, invoking host input side effects, invoking native adapters, or exposing raw input details

### Requirement: Agent shell CLI remote interaction diagnostics remain metadata-only

The agent shell CLI SHALL keep all remote interaction exerciser diagnostics metadata-only. CLI usage errors, expected send failures, unexpected runtime diagnostics, logs, and local status output MUST NOT include raw frame data, screen contents, pointer coordinates, button values, key values, code values, modifier values, raw input payloads, keylogging buffers, clipboard contents, file contents, diagnostics dumps, credentials, tokens, pairing codes, private reasons, or full secrets.

#### Scenario: Scheduled remote interaction send fails
- **WHEN** a scheduled CLI remote interaction send fails because authorization is missing, stale, misrouted, audit-blocked, disconnected, malformed, or otherwise rejected
- **THEN** the CLI reports only bounded generic failure metadata
- **AND** it MUST NOT retry in a loop, reconnect peers, grant permissions, suppress host visibility, start capture, inject input, install services, configure startup persistence, elevate privileges, hide the session, or bypass Windows prompts

#### Scenario: Remote interaction CLI remains non-native
- **WHEN** a host or viewer uses the development remote interaction CLI options
- **THEN** the process MUST NOT capture the screen, render a remote desktop UI, inject OS input, sync clipboard, transfer files, collect diagnostics, install services, configure startup persistence, elevate privileges, run unattended, collect credentials, keylog, evade AV/EDR, or bypass Windows prompts
