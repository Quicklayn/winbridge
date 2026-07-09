## Context

The loopback-only viewer local control surface is the closest current MVP user interface for viewing and controlling a remote Windows host. It already renders the latest authorized frame, offers explicit pointer arming, provides a manual command box, and exposes fixed keyboard controls for modifiers plus navigation keys.

Common assistance tasks often require typing short values or activating application shortcuts. The current command box can send `key-down KeyA`, but that is not ergonomic enough for MVP trials. The safer improvement is a fixed visible key palette rather than document-level keyboard capture or a typed-text field.

## Goals / Non-Goals

**Goals:**

- Add visible fixed key buttons for `KeyA` through `KeyZ`, `Digit0` through `Digit9`, and `Space`.
- Reuse the existing `sendKeyPress()` path so every button sends exactly one `key-down` and one `key-up`.
- Keep all keyboard buttons disabled until a displayed frame is ready and the sanitized viewer status reports active visible keyboard readiness.
- Preserve one-shot modifier toggles for explicit button presses.
- Keep HTTP responses metadata-only and avoid exposing key values, modifier values, raw commands, tokens, pairing codes, or authorization ids.

**Non-Goals:**

- No document-level or window-level keyboard listeners.
- No typed text buffering, macro recording, keylogging, clipboard reads, or paste support.
- No new protocol messages, permissions, audit schema, relay behavior, Windows input adapter behavior, native UI, or production packaging.

## Decisions

1. Render the palette as fixed HTML buttons.

   This keeps the interaction explicit and visible. The alternative, capturing browser keyboard events, would be more ergonomic but risks accidental key capture and violates the project safety boundary.

2. Use protocol key names in `data-key-command` and safe display labels in button text.

   The local page already sends protocol key names through `sendKeyPress()`. Keeping labels separate from data attributes avoids adding parsing logic or free-form text conversion.

3. Keep server-side behavior unchanged.

   The `/input` endpoint already validates exact commands and routes through runtime authorization. The new palette only generates more of the same reviewed command shape.

## Risks / Trade-offs

- More buttons can make the footer crowded -> Mitigation: use a wrapping key palette with compact fixed buttons.
- Operators may expect normal typing -> Mitigation: document that only explicit visible buttons and exact manual commands send input.
- Button labels reveal intended key names in the local HTML -> Mitigation: this is local visible UI only; HTTP mutation responses, logs, and audit records remain metadata-only and do not echo key values.
