## ADDED Requirements

### Requirement: Viewer local control surface exposes bounded alphanumeric key palette

The opt-in viewer local control surface SHALL expose visible fixed keyboard
buttons for the protocol-supported keys `KeyA` through `KeyZ`, `Digit0` through
`Digit9`, and `Space` in addition to the existing explicit navigation/control
key buttons and modifier toggles. Each alphanumeric or space key button MUST
send exactly one `key-down <key> [modifiers]` command and exactly one
`key-up <key> [modifiers]` command through the existing token-protected
same-origin `/input` path and the existing runtime `sendInputEvent()`
authorization checks. The buttons MUST be disabled until a displayed frame is
ready and the sanitized viewer status reports active visible
`input:keyboard` readiness. Modifier toggles MAY apply to one explicit
alphanumeric, space, navigation, or control key button press and MUST still be
cleared after one attempted explicit key press.

The surface MUST NOT install document-level or window-level keyboard listeners,
capture physical keyboard input, buffer typed text, record macros, read
clipboard data, synthesize arbitrary free-form text, expose key values or
modifier values in HTTP mutation responses, bypass host consent, bypass active
visible authorization, bypass audit-before-send, start capture, apply host
input directly, hide the host active-session indicator, run unattended, install
services, configure startup persistence, elevate privileges, evade AV/EDR, or
bypass Windows prompts.

#### Scenario: Alphanumeric key buttons are rendered

- **WHEN** the viewer local control surface is rendered
- **THEN** the generated page includes fixed visible key buttons for `KeyA`
  through `KeyZ`, `Digit0` through `Digit9`, and `Space`
- **AND** the page does not attach document-level or window-level keyboard
  listeners, typed-text buffers, macro recorders, clipboard readers, or hidden
  key capture handlers

#### Scenario: Alphanumeric key buttons use existing input path

- **WHEN** the viewer page has a ready frame, active visible keyboard
  readiness, and the viewer clicks an alphanumeric or space key button
- **THEN** the page sends the existing bounded `key-down <key> [modifiers]`
  and `key-up <key> [modifiers]` commands through the protected `/input` path
- **AND** server responses remain metadata-only and do not expose key values,
  modifier values, raw command text, tokens, pairing codes, authorization ids,
  credentials, private reasons, or full secrets

#### Scenario: Key palette stays disabled before keyboard readiness

- **WHEN** the viewer local control surface has no displayed ready frame or the
  sanitized viewer status is not active, not visible, or not keyboard-ready
- **THEN** alphanumeric, space, navigation, and control key buttons remain
  disabled
- **AND** clicking disabled key controls MUST NOT send input, grant
  permissions, activate visibility, start capture, apply input, hide host
  indicators, or bypass runtime authorization gates
