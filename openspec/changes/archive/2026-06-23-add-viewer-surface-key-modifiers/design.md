## Context

The viewer local control surface is an opt-in loopback HTTP page served by the viewer CLI. It already exposes explicit keyboard buttons and a manual command box that both route through the same token-protected `/input` endpoint and runtime `sendInputEvent()` authorization gates. Existing specs prohibit document-level keyboard capture and text buffering.

## Goals / Non-Goals

**Goals:**

- Let the viewer combine existing explicit keyboard buttons with common modifiers.
- Keep modifier state visible, bounded, and local to the browser page.
- Clear selected modifiers after one key press so repeated modified input requires another explicit viewer action.
- Preserve no raw key/modifier leakage in HTTP responses and diagnostics.

**Non-Goals:**

- No typed text sending, clipboard sync, macro recording, keylogging, global keyboard listeners, or document/window key capture.
- No new permissions or bypass of `input:keyboard` authorization.
- No production desktop viewer UI.

## Decisions

- Use toggle buttons instead of keyboard shortcuts. This keeps the action visible and avoids hidden key capture.
- Reuse the existing `key-down key [modifiers]` and `key-up key [modifiers]` command grammar. This avoids new protocol or runtime input shapes.
- Clear modifier toggles after `sendKeyPress()` completes or fails. This reduces accidental repeated modified keys while still allowing deliberate repeated use.
- Keep modifier state entirely client-side in the served HTML. The server continues to receive only one bounded command at a time via the existing `/input` route.

## Risks / Trade-offs

- Accidental modified key press -> toggles are visibly pressed and reset after one key action.
- Browser page complexity increases -> limit the change to four fixed modifiers and focused tests.
- Some users may expect typed text entry -> explicitly do not add it because the current safety contract forbids text buffering and global keyboard capture.
