## ADDED Requirements

### Requirement: Viewer local control surface supports explicit key modifiers

The opt-in viewer local control surface SHALL expose visible fixed modifier toggles for `shift`, `control`, `alt`, and `meta` that can be applied only to explicit keyboard button actions. Modifier toggles MUST be disabled until a displayed frame is ready, MUST NOT send input by themselves, and MUST be cleared after one attempted explicit key press. The surface MUST continue routing key input through the existing token-protected same-origin `/input` path and runtime `sendInputEvent()` authorization checks. It MUST NOT install document-level or window-level keyboard listeners, buffer typed text, record macros, capture keystrokes, read clipboard data, expose key or modifier values in HTTP responses, or bypass host consent and active visible `input:keyboard` authorization.

#### Scenario: Modifier toggles apply to one explicit key press

- **WHEN** the viewer page has a ready frame, the viewer enables a visible modifier toggle, and then clicks an explicit keyboard button
- **THEN** the page sends the existing bounded `key-down <key> <modifiers>` and `key-up <key> <modifiers>` commands through the protected `/input` path
- **AND** it clears modifier toggles after that attempted key press
- **AND** the server response remains metadata-only and does not expose key values, modifier values, raw command text, tokens, pairing codes, credentials, private reasons, or full secrets

#### Scenario: Modifier toggles do not capture keyboard input

- **WHEN** the viewer local control surface is rendered
- **THEN** it provides only fixed visible modifier buttons and existing explicit key buttons for modified keyboard input
- **AND** it MUST NOT attach document-level or window-level keyboard listeners, buffer typed text, record macros, read clipboard data, send modifier-only input, or bypass runtime authorization gates

#### Scenario: Modifier toggles stay unavailable before a frame is ready

- **WHEN** the viewer local control surface has no displayed ready frame
- **THEN** modifier toggles are disabled along with pointer arming controls
- **AND** toggling modifier UI MUST NOT send input, grant permissions, activate visibility, hide host indicators, or start capture
