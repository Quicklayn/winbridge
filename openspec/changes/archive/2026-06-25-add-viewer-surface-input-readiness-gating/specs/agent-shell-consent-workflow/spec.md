## ADDED Requirements

### Requirement: Local viewer surface gates visible input controls on readiness

The opt-in viewer local control surface SHALL keep visible input-sending
controls disabled until the generated page has both a ready displayed frame and
sanitized viewer status indicating active visible authorization with at least
one granted permission. The generated page SHALL apply this local readiness
gate to pointer arming, modifier toggles, explicit key buttons, and the manual
send action. The disconnect action MAY remain available while input is not
ready. This local UI gate MUST NOT replace runtime authorization: every input
POST MUST still pass the existing token, origin, content-type, active visible
authorization, permission, routing, socket, audit, pause, revoke, termination,
expiration, disconnect, and redaction gates. Readiness text and HTTP responses
MUST NOT expose authorization ids, raw command text, pointer coordinates, key
values, modifier values, frame paths, frame bytes, tokens, pairing codes,
credentials, private reasons, screen contents, input contents, clipboard
contents, diagnostics dumps, or full secrets.

#### Scenario: Input controls are disabled before readiness

- **WHEN** the generated viewer page has no ready displayed frame or the
  sanitized viewer status is inactive, invisible, or has no granted permissions
- **THEN** visible controls that can send input remain disabled or unarmed
- **AND** the page MUST NOT send input, grant permissions, activate visibility,
  reconnect peers, start capture, hide host visibility, or bypass runtime
  authorization gates

#### Scenario: Input controls enable after local readiness

- **WHEN** the generated viewer page has a ready displayed frame and sanitized
  viewer status reports `state=active`, `visibleToHost=true`, and a positive
  permission count
- **THEN** the page may enable visible pointer arming, modifier toggles,
  explicit key buttons, and manual send controls
- **AND** accepted clicks still route through the existing token-protected
  local `/input` path and runtime authorization gates
