## Context

The generated local viewer surface polls `/frame` to display the latest
authorized frame file. Pointer arming is now gated on `frameReady`, but
`refreshFrame()` sets `frameReady=false` before every poll. That matches a
strict "loading is not ready" interpretation, but it makes the ready displayed
frame unusable during ordinary polling.

## Goals / Non-Goals

**Goals:**

- Keep a displayed ready frame usable while the next frame is loading.
- Keep pointer arming disabled before the first frame load and after an
  initial/only-frame failure.
- Avoid exposing frame paths, frame bytes, raw errors, or diagnostics.
- Keep all behavior inside the generated loopback-only development page.

**Non-Goals:**

- No new permission, protocol message, endpoint, native input behavior, or
  production viewer UI.
- No hidden pointer capture, global input listeners, clipboard, macros, file
  transfer, diagnostics collection, startup persistence, privilege elevation, or
  Windows prompt bypass.

## Decisions

- Use a temporary `Image` object for each refresh request. Only assign
  `frame.src` after the temporary image has loaded.
- Track a monotonically increasing request sequence so stale load/error events
  from older refreshes cannot overwrite newer state.
- Report `frame=refreshing` while a replacement is loading over an existing
  ready displayed frame, and keep `frame=loading` for the initial no-frame case.
- If a refresh fails while a displayed frame is ready, keep `frame=ready` and do
  not disarm pointer mode. If no displayed frame is ready, report
  `frame=not-ready` and keep pointer arming disabled.

## Risks / Trade-offs

- [Risk] Pointer input can target the last displayed frame for up to one refresh
  interval if a replacement frame fails.
  -> Mitigation: this is visible, bounded by the latest displayed frame, and all
  runtime authorization/audit/permission gates still apply.
- [Risk] Generated HTML tests are string-based.
  -> Mitigation: assertions target stable state names, preload markers, and
  guard expressions.
