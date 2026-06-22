## Context

The agent shell already supports a viewer control prompt for local status and
viewer disconnect, plus a one-shot scheduled development input sender. The host
can explicitly opt into native Windows input application with local audit. The
remaining development MVP gap is an interactive viewer loop that can send
explicit input events while preserving the existing consent-first boundaries.

## Goals / Non-Goals

**Goals:**

- Add explicit pointer and keyboard commands to the viewer control prompt.
- Parse only bounded command forms and reject malformed input without echoing
  raw command text.
- Use the existing runtime `sendInputEvent()` method for all outbound input so
  authorization, routing, audit-before-send, disconnect, pause, revoke,
  expiration, and redaction behavior remains centralized.
- Keep prompt output metadata-only: command kind and success/failure status, not
  coordinates, buttons, key names, modifiers, raw command text, tokens, pairing
  codes, credentials, or private reasons.
- Preserve `help`, `status`, and `disconnect` behavior.

**Non-Goals:**

- No desktop viewer UI, mouse capture, keyboard capture, free-form text typing,
  command macros, hotkeys, clipboard, file transfer, diagnostics, remote shell,
  services, startup persistence, installer behavior, privilege elevation,
  unattended access, AV/EDR evasion, hidden input, or Windows prompt bypass.

## Decisions

1. Keep input sends behind existing runtime gates.

   The prompt will not construct protocol messages directly. It will read the
   current viewer status, require active visible authorization metadata, and
   call `sendInputEvent()` with a single parsed event. The runtime remains the
   authority for required permission, observed host routing, socket state,
   local/remote disconnect state, audit-before-send, and sanitized failures.

2. Use exact development command forms instead of raw text.

   Commands will represent one protocol-supported event at a time:
   `pointer-move`, `pointer-down`, `pointer-up`, `pointer-wheel`, `key-down`,
   and `key-up`. The parser will reject whitespace-padded, case-varied,
   suffixed, macro-shaped, text-buffer-shaped, unsupported button, duplicate
   modifier, unsafe coordinate, and unsafe wheel delta input before calling the
   runtime.

3. Keep local prompt diagnostics metadata-only.

   Success output will identify only the accepted action and input kind. Failure
   output will use the existing CLI error formatter or generic rejection line.
   This avoids leaking pointer coordinates, key names, modifiers, raw command
   contents, tokens, pairing codes, credentials, or private reasons.

4. Do not require input permissions to start the prompt.

   Starting the prompt remains useful for `help`, `status`, and `disconnect`
   without requested permissions. Input commands fail closed at command time
   unless the viewer currently has active visible authorization with the
   matching `input:pointer` or `input:keyboard` permission.

## Risks / Trade-offs

- Input commands can drive a host that has opted into native input application
  -> mitigation: existing consent, visibility, permission, audit-before-send,
  host opt-in, host audit-before-native-input, pause/revoke/disconnect, and
  redaction gates remain in the path.
- A terminal prompt is not a polished viewer UX -> mitigation: this creates a
  bounded development MVP control loop while production viewer UI remains a
  separate OpenSpec-reviewed change.
- Keyboard commands can be mistaken for text typing -> mitigation: only
  protocol key names are accepted one event at a time; free-form text buffers,
  paste, macros, and key capture are out of scope.
