## MODIFIED Requirements

### Requirement: Local viewer surface gates visible input controls on readiness

The opt-in viewer local control surface SHALL keep visible input-sending
controls disabled until the generated page has both a ready displayed frame and
sanitized viewer status indicating active visible authorization with bounded
input readiness metadata for the matching input kind. The generated page SHALL
gate pointer arming and browser pointer interactions on bounded `input:pointer`
readiness metadata, and SHALL gate explicit key buttons and modifier toggles on
bounded `input:keyboard` readiness metadata. The manual send action SHALL remain
disabled until at least one input permission readiness flag is true. The
disconnect action MAY remain available while input is not ready. This local UI
gate MUST NOT replace runtime authorization: every input POST MUST still pass
the existing token, origin, content-type, active visible authorization,
permission, routing, socket, audit, pause, revoke, termination, expiration,
disconnect, and redaction gates. Readiness text, status responses, and HTTP
responses MUST NOT expose authorization ids, raw permission lists, raw command
text, pointer coordinates, key values, modifier values, frame paths, frame
bytes, tokens, pairing codes, credentials, private reasons, screen contents,
input contents, clipboard contents, diagnostics dumps, or full secrets.

#### Scenario: Input controls are disabled before readiness

- **WHEN** the generated viewer page has no ready displayed frame, sanitized
  viewer status is inactive or invisible, or neither input permission readiness
  flag is true
- **THEN** visible controls that can send input remain disabled or unarmed
- **AND** the page MUST NOT send input, grant permissions, activate visibility,
  reconnect peers, start capture, hide host visibility, or bypass runtime
  authorization gates

#### Scenario: Pointer controls require pointer readiness

- **WHEN** the generated viewer page has a ready displayed frame and sanitized
  viewer status reports active visible authorization with
  `inputPointerReady=false`
- **THEN** pointer arming and browser pointer interactions remain unavailable
- **AND** the page MUST NOT send pointer input, grant permissions, hide host
  visibility, or bypass runtime authorization gates

#### Scenario: Keyboard controls require keyboard readiness

- **WHEN** the generated viewer page has a ready displayed frame and sanitized
  viewer status reports active visible authorization with
  `inputKeyboardReady=false`
- **THEN** explicit key buttons and modifier toggles remain unavailable
- **AND** the page MUST NOT send keyboard input, buffer typed text, capture
  keystrokes, read clipboard data, or bypass runtime authorization gates

#### Scenario: Input controls enable after matching local readiness

- **WHEN** the generated viewer page has a ready displayed frame and sanitized
  viewer status reports active visible authorization with
  `inputPointerReady=true` or `inputKeyboardReady=true`
- **THEN** only the visible controls for the matching ready input kind may
  become enabled
- **AND** accepted clicks still route through the existing token-protected
  local `/input` path and runtime authorization gates

#### Scenario: Readiness metadata remains bounded

- **WHEN** the local viewer page polls `/status`
- **THEN** the response may include only bounded boolean input readiness
  metadata for supported input kinds
- **AND** it MUST NOT include raw permission arrays, authorization ids,
  command text, pointer coordinates, key values, modifier values, frame paths,
  frame bytes, tokens, pairing codes, credentials, private reasons, screen
  contents, input contents, clipboard contents, diagnostics dumps, or full
  secrets
