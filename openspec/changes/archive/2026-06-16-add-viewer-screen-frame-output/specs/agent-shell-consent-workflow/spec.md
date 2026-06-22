## ADDED Requirements

### Requirement: Agent shell viewer writes consent-bound screen frames to an explicit output file

The agent shell CLI SHALL expose a viewer-only option that requires local audit
configuration and writes the latest authorized inbound `screen-frame` payload to
an explicit local output file. The runtime MUST invoke the output sink only
after the inbound frame passes existing sender role, sender peer id, session id,
target peer id, authorization id, visible active unexpired authorization state,
and `screen:view` permission checks. The runtime MUST write metadata-only local
audit before persisting frame bytes and MUST NOT write the output file if audit
persistence fails or local audit is not configured.

#### Scenario: Viewer writes an authorized screen frame
- **WHEN** a viewer CLI process is started with a valid screen-frame output path, local audit configuration, and `screen:view` request
- **AND** the viewer receives a `screen-frame` from the observed host for the active visible unexpired authorization that grants `screen:view`
- **THEN** the runtime writes metadata-only local audit before writing the frame bytes to the configured output file
- **AND** local events, logs, audit records, thrown errors, and status output MUST NOT expose raw frame bytes, encoded frame data, screenshots, screen contents, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Viewer output lacks authorization
- **WHEN** a viewer receives a `screen-frame` while authorization is paused, revoked, terminated, expired, invisible, missing, misbound, or missing `screen:view`
- **THEN** the runtime rejects or ignores the frame before metadata-only output audit, output file writes, trusted received event emission, rendering side effects, native adapter calls, reconnection, hidden session behavior, or consent bypass

#### Scenario: Viewer output audit fails
- **WHEN** a viewer is otherwise authorized to persist an inbound screen frame but metadata-only local audit persistence fails
- **THEN** the runtime rejects the output operation before writing frame bytes to the configured output file
- **AND** diagnostics MUST remain bounded and MUST NOT expose raw frame bytes, encoded frame data, screenshots, screen contents, credentials, tokens, pairing codes, private reasons, command output, or full secrets

#### Scenario: Viewer output configuration is malformed
- **WHEN** a host or viewer CLI process is started with malformed screen-frame output configuration such as role mismatch, missing `screen:view`, missing local audit configuration, blank path, unsafe Windows device namespace path, reserved name, alternate data stream, or unsupported path text
- **THEN** it exits through bounded usage handling before opening a relay connection, sending protocol messages, writing audit records, persisting frame bytes, rendering frames, invoking native adapters, reconnecting peers, hiding the session, or bypassing consent

#### Scenario: Viewer output remains scoped to explicit viewing
- **WHEN** a viewer uses the screen-frame output option
- **THEN** the process MUST NOT capture the local screen, inject OS input, sync clipboard, transfer files, collect diagnostics, install services, configure startup persistence, elevate privileges, run unattended, collect credentials, keylog, evade AV/EDR, bypass Windows prompts, or hide the active host session indicator
