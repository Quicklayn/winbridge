## ADDED Requirements

### Requirement: Agent shell CLI exercises consent-bound development frame streams

The agent shell CLI SHALL expose a host-only non-native development operation that sends a finite sequence of `screen-frame` messages through the dedicated runtime screen-frame method. The operation MUST validate the frame source, frame count, frame interval, derived frame ids, and timing controls before runtime startup. Each frame send MUST wait for active visible unexpired authorization that grants `screen:view` and rely on the runtime method for final authorization, routing, audit-before-send, socket, and redaction gates.

#### Scenario: Host streams bounded development frames
- **WHEN** a host CLI process is started with a valid development screen-frame stream count greater than one and a positive interval
- **AND** the host later has active visible unexpired `screen:view` authorization
- **THEN** it sends no more than the configured count of schema-valid `screen-frame` messages through the dedicated runtime screen-frame method
- **AND** each frame uses a deterministic schema-valid derived frame id and monotonically increasing sequence
- **AND** each accepted send path MUST write metadata-only local audit before socket write
- **AND** CLI output, runtime events, logs, and audit records MUST NOT expose raw frame bytes, encoded frame data, screenshots, screen contents, credentials, tokens, pairing codes, private reasons, or full secrets

#### Scenario: Frame stream waits for authorization
- **WHEN** the host CLI frame stream starts before active visible `screen:view` authorization exists
- **THEN** it waits without sending frames, writing accepted-send audit records, emitting local sent events, opening native adapters, capturing the screen, reconnecting peers, granting permissions, hiding the session, or bypassing consent

#### Scenario: Frame stream stops after authorization loss
- **WHEN** a host CLI frame stream has sent fewer than the configured count and authorization becomes paused, revoked, terminated, expired, invisible, disconnected, or no longer grants `screen:view`
- **THEN** it MUST stop before any further accepted-send audit, socket write, local sent event emission, capture side effects, rendering side effects, native adapter calls, reconnection, hidden session behavior, or consent bypass
- **AND** it MUST NOT continue retrying in a send loop

#### Scenario: Frame stream configuration is malformed
- **WHEN** a host CLI process is started with malformed development frame stream configuration such as missing positive interval for multi-frame streaming, unsafe frame count, frame id suffix overflow, role-mismatched use, malformed frame source, or unsupported frame source option combinations
- **THEN** it exits through bounded usage handling before opening a relay connection, sending protocol messages, writing audit records, starting capture, rendering frames, invoking native adapters, or exposing the raw frame payload

#### Scenario: Frame stream remains non-native
- **WHEN** a host uses development frame stream CLI options
- **THEN** the process MUST NOT capture the screen, read arbitrary frame files, render a remote desktop UI, inject OS input, sync clipboard, transfer files, collect diagnostics, install services, configure startup persistence, elevate privileges, run unattended, collect credentials, keylog, evade AV/EDR, or bypass Windows prompts
