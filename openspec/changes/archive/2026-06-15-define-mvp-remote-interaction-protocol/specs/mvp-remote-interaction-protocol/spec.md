## ADDED Requirements

### Requirement: Consent-bound screen frame envelope

The protocol SHALL define a host-to-viewer screen frame envelope for MVP remote viewing, and every screen frame MUST carry a valid authorization id, frame id, sequence number, capture timestamp, frame format, dimensions, and bounded encoded frame data.

#### Scenario: Valid screen frame is accepted
- **WHEN** the host sends a schema-valid screen frame for an active authorization that grants `screen:view`
- **THEN** protocol validation accepts the envelope for relay/runtime authorization checks

#### Scenario: Screen frame lacks authorization
- **WHEN** a screen frame omits `authorizationId` or uses a malformed authorization id
- **THEN** protocol validation rejects the envelope before it can be forwarded or rendered

#### Scenario: Screen frame payload is oversized
- **WHEN** a screen frame carries encoded frame data beyond the protocol size bound
- **THEN** protocol validation rejects the envelope before relay forwarding

#### Scenario: Screen frame has unsafe metadata
- **WHEN** a screen frame has unknown fixed fields, invalid dimensions, invalid timestamps, malformed identifiers, or unsupported frame format
- **THEN** protocol validation rejects the envelope without exposing raw frame contents in diagnostics

### Requirement: Consent-bound input event envelope

The protocol SHALL define a viewer-to-host input event envelope for MVP remote control, and every input event MUST carry a valid authorization id, event id, sequence number, occurrence timestamp, event kind, and bounded event details.

#### Scenario: Valid pointer input is accepted
- **WHEN** the viewer sends a schema-valid pointer input event for an active authorization that grants `input:pointer`
- **THEN** protocol validation accepts the envelope for relay/runtime authorization checks

#### Scenario: Valid keyboard input is accepted
- **WHEN** the viewer sends a schema-valid keyboard input event for an active authorization that grants `input:keyboard`
- **THEN** protocol validation accepts the envelope for relay/runtime authorization checks

#### Scenario: Input event lacks authorization
- **WHEN** an input event omits `authorizationId` or uses a malformed authorization id
- **THEN** protocol validation rejects the envelope before it can be forwarded or applied to the host

#### Scenario: Input event attempts text capture or keylogging
- **WHEN** an input event includes unknown fixed fields, credential-bearing metadata, keylogging buffers, clipboard contents, file contents, diagnostics dumps, or raw screen contents
- **THEN** protocol validation rejects the envelope before relay forwarding or host-side input processing

### Requirement: Interaction protocol remains non-authorizing

The remote interaction protocol SHALL remain a message contract only; it MUST NOT by itself approve sessions, activate host visibility, grant permissions, start capture, inject input, reconnect peers, suppress host visibility, install services, configure startup persistence, elevate privileges, collect credentials, hide the session, or bypass Windows prompts.

#### Scenario: Active grant is absent
- **WHEN** a schema-valid screen frame or input event is received without an active visible unexpired authorization granting the required permission
- **THEN** runtime authorization checks MUST deny the action before rendering, capture side effects, input side effects, or native adapter calls

#### Scenario: Authorization is paused or revoked
- **WHEN** the host pauses, revokes, terminates, denies, or lets the authorization expire
- **THEN** later screen frames and input events for that authorization MUST fail closed before rendering, capture side effects, input side effects, or native adapter calls

#### Scenario: Protocol validation succeeds
- **WHEN** protocol validation accepts a remote interaction envelope
- **THEN** acceptance MUST NOT grant consent, permissions, host visibility, capture, input, reconnection, persistence, privilege elevation, or prompt bypass behavior by itself
