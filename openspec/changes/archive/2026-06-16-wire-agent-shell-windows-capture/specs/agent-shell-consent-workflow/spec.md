## ADDED Requirements

### Requirement: Agent shell CLI sends consent-bound Windows capture frames

The agent shell CLI SHALL expose a host-only development screen-frame source
that captures the Windows primary screen through the reviewed Windows capture
adapter and sends the resulting frame through the dedicated runtime
screen-frame method. Native capture MUST be invoked only inside the host runtime
after internal active visible unexpired authorization grants `screen:view`, peer
routing is available, the local socket is open, the remote peer is connected,
and metadata-only local audit for the capture attempt has been persisted.

#### Scenario: Host sends a captured Windows frame
- **WHEN** a host CLI process is started with the Windows capture screen-frame source and later has active visible unexpired `screen:view` authorization
- **THEN** the runtime writes metadata-only local capture audit before invoking the Windows capture adapter
- **AND** it sends the captured PNG through the existing `sendScreenFrame()` path
- **AND** existing screen-frame send authorization, routing, audit-before-send, socket, and redaction gates still apply

#### Scenario: Capture source lacks authorization
- **WHEN** the host CLI capture source fires before active visible unexpired `screen:view` authorization exists
- **THEN** it waits without invoking native capture, writing capture audit, sending screen frames, opening native adapters, reconnecting peers, hiding the session, or bypassing consent

#### Scenario: Authorization is lost during capture stream
- **WHEN** a finite Windows capture frame stream has sent fewer than the configured count and authorization becomes paused, revoked, terminated, expired, invisible, disconnected, or no longer grants `screen:view`
- **THEN** it stops before further capture audit, native capture, accepted-send audit, socket write, local sent event emission, reconnection, hidden session behavior, or consent bypass

#### Scenario: Capture audit fails
- **WHEN** the runtime is otherwise authorized to capture a Windows frame but metadata-only local capture audit persistence fails
- **THEN** the runtime rejects before invoking native capture, sending a frame, writing accepted-send audit, or exposing raw screen contents

#### Scenario: Capture adapter fails
- **WHEN** the Windows capture adapter rejects or returns invalid output
- **THEN** the CLI reports only bounded generic failure metadata
- **AND** it MUST NOT expose raw frame bytes, encoded frame data, screenshots, screen contents, credentials, tokens, pairing codes, private reasons, command output, or full secrets

#### Scenario: Capture source configuration is malformed
- **WHEN** a host or viewer CLI process is started with malformed Windows capture source configuration such as role mismatch, static frame payload options mixed with capture source, unsafe count, missing interval for multi-frame streaming, or unsafe frame ids
- **THEN** it exits through bounded usage handling before opening native capture, sending protocol messages, writing audit records, reconnecting peers, hiding the session, or bypassing consent

#### Scenario: Capture source remains scoped to viewing
- **WHEN** a host uses the Windows capture screen-frame source
- **THEN** the process MUST NOT render a viewer desktop, inject OS input, sync clipboard, transfer files, collect diagnostics, install services, configure startup persistence, elevate privileges, run unattended, collect credentials, keylog, evade AV/EDR, bypass Windows prompts, or hide capture from the host
