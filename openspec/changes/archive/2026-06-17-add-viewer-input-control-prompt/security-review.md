## Security Review

Scope reviewed:

- `apps/agent-shell` viewer control prompt command parsing and runtime calls.
- Prompt input command authorization, diagnostics, redaction, and failure paths.
- Interaction with existing `sendInputEvent()` gates, host input opt-in, and
  Windows input adapter reachability.
- Documentation and OpenSpec impact for MVP remote-control boundaries.

Findings:

- Viewer input prompt is viewer-only through the existing
  `--viewer-control-prompt` CLI validation and remains mutually exclusive with
  one-shot viewer status and viewer disconnect timers.
- Accepted input commands are explicit one-event command lines only:
  pointer-move, pointer-down, pointer-up, pointer-wheel, key-down, and key-up.
- Parser rejects whitespace-padded, case-varied, suffixed, unsupported-button,
  duplicate-modifier, unsafe-coordinate, unsafe-delta, free-form-text,
  macro-shaped, and raw-JSON command input before reading runtime status or
  calling `sendInputEvent()`.
- Keyboard values are validated through the shared protocol envelope parser
  before runtime send attempts. Free-form text buffers and repeated key capture
  are not accepted.
- Prompt input sends first read current viewer status and require active visible
  authorization metadata before calling the managed runtime input send path.
- `sendInputEvent()` remains the authority for required input permission,
  observed host routing, socket state, local/remote disconnect state,
  audit-before-send, local sent events, and redaction.
- Prompt success output includes only action and input kind. Prompt failures use
  existing sanitized CLI diagnostics or a generic rejection line.
- Prompt output, tests, and docs avoid exposing pointer coordinates, button
  values, key values, modifiers, raw command lines, tokens, pairing codes,
  credentials, command output, private reasons, or full secrets.
- The change adds no input capture, keylogging, clipboard sync, file transfer,
  diagnostics collection, services, startup persistence, privilege elevation,
  unattended access, AV/EDR evasion, Windows prompt bypass, hidden session
  behavior, or host indicator suppression.

Verification performed:

- Focused viewer control prompt tests for exact parser behavior, help output,
  status/disconnect compatibility, pointer sends, keyboard sends, malformed
  input rejection, stale authorization, runtime failure sanitization, and
  oversized command rejection.
- TypeScript check for all workspaces.

Residual risk:

- This is still a terminal-based development control loop, not a production
  viewer UI. Production viewer UX, pointer scaling over rendered frames,
  identity, transport hardening, installer behavior, and broader Windows E2E
  tests require separate OpenSpec changes and review.
