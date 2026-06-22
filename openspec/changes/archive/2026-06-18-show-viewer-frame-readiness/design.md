## Context

The local viewer page polls `/status` and refreshes the `<img>` source from
`/frame`. If `/status` is active before the first frame is persisted, the page
does not clearly tell the operator that the session is alive but the frame is
not ready yet.

## Goals / Non-Goals

**Goals:**

- Show separate bounded frame readiness text on the local viewer page.
- Use only browser image load/error events from the existing `/frame` request.
- Keep diagnostics secret-safe and avoid exposing paths or frame bytes.

**Non-Goals:**

- No protocol changes.
- No new frame endpoint, retry policy, buffering, or capture behavior.
- No new input behavior.

## Decisions

- Add a dedicated `frameStatus` element rather than overloading the existing
  authorization/status text. Operators need to distinguish session status from
  frame availability.
- Set `frame=loading` before refreshing `src`, `frame=ready` on image load, and
  `frame=not-ready` on image error. This uses the browser's normal image
  request result and avoids parsing frame error bodies in page script.

## Risks / Trade-offs

- [Risk] Image error hides the exact server error.
  -> Mitigation: the UI intentionally exposes only bounded readiness state; raw
  paths, diagnostics, and frame bytes remain off the page.
