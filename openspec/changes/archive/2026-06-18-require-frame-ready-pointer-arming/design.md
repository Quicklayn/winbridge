## Context

The local viewer surface is a development MVP helper that renders the latest
authorized frame file and can send browser-originated pointer events after a
visible same-page pointer arming action. The current page disarms on image
error, but it does not model frame readiness separately from pointer arming.

## Goals / Non-Goals

**Goals:**

- Require both explicit pointer arming and a ready latest-frame image before
  browser pointer events can send input.
- Make the disabled/not-ready state visible through the existing pointer button.
- Keep the change local to generated page state and tests.

**Non-Goals:**

- No new permission, protocol message, endpoint, native input behavior, or
  production viewer UI.
- No hidden pointer capture, global input listeners, keyboard capture,
  clipboard, macros, file transfer, diagnostics collection, services, startup
  persistence, privilege elevation, or Windows prompt bypass.

## Decisions

- Add a local `frameReady` boolean in the generated page.
- Set `frameReady=false` and `pointerArmed=false` before each frame refresh and
  on frame error. Set `frameReady=true` only from the image load handler.
- Disable the `Pointer Off/On` button while `frameReady=false`; attempts to
  click while disabled are browser-blocked and the click handler also returns
  fail-closed.
- Gate pointerdown, pointerup, pointermove, and wheel handlers on
  `pointerArmed && frameReady`.

## Risks / Trade-offs

- [Risk] Pointer mode turns off during every frame refresh.
  -> Mitigation: this is safer for MVP and matches the current latest-frame
  polling model; future production UI can use a richer media pipeline after a
  dedicated spec.
- [Risk] Tests are string-based because the page is generated HTML.
  -> Mitigation: assertions target stable state names, guards, and disabled
  button behavior.
