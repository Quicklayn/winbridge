## Context

The generated viewer local surface is an opt-in development browser helper. It
already requires same-origin mutation tokens and runtime authorization gates,
but its pointer event handlers are active as soon as the page loads.

## Goals / Non-Goals

**Goals:**

- Require a visible same-page action before browser pointer movement, wheel, or
  button events send remote input.
- Keep browser-native context menu and image drag behavior from interrupting
  frame-scoped pointer gestures.
- Keep pointer arming local to the generated page and bounded to simple state
  text/button state.
- Preserve existing `/input` validation, audit-before-send, runtime permission
  gates, and redaction.

**Non-Goals:**

- No new permission, protocol message, endpoint, native input behavior, or
  production viewer UI.
- No hidden pointer capture or global event listeners.

## Decisions

- Add a `Pointer Off/On` toggle button with `aria-pressed` state. This is a
  familiar explicit control and avoids sending remote pointer input through
  accidental hover.
- Gate pointerdown, pointerup, pointermove, and wheel handlers on the local
  `pointerArmed` boolean. Command-box pointer commands remain available because
  they are already explicit typed commands.
- Disarm pointer mode when frame loading fails. This avoids keeping a stale
  armed state when the surface is not displaying a current frame.
- Prevent `contextmenu` and `dragstart` defaults only on the remote frame
  element. This keeps the page from installing global input capture while
  avoiding browser UI over the frame during an explicit pointer-control session.

## Risks / Trade-offs

- [Risk] One extra click before pointer control.
  -> Mitigation: the button is visible in the existing footer and its state is
  explicit.
- [Risk] Tests are string-based because the page is generated HTML.
  -> Mitigation: assertions target stable IDs, bounded state strings, and
  handler guards.
