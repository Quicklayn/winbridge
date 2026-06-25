## Context

The local viewer surface polls `/frame` and swaps the displayed image only after
the replacement image loads. A failed replacement refresh preserves the last
ready frame and keeps pointer arming available. That is useful, but the UI only
shows `frame=ready`, so the operator cannot tell whether the visible frame is
fresh or old.

## Goals / Non-Goals

**Goals:**

- Track displayed-frame freshness entirely in the generated page.
- Show bounded age buckets in the existing frame status text.
- Mark the frame stale after a conservative local threshold.
- Keep all diagnostics metadata-only.

**Non-Goals:**

- No server-side frame metadata endpoint.
- No changes to frame write/read semantics.
- No reconnect or transport changes.
- No Windows capture, OS input, clipboard, file transfer, installer, service,
  startup, privilege, or prompt behavior changes.

## Decisions

- Use client-side time since the last successful replacement image load. This
  avoids adding file timestamps, paths, URLs, or server diagnostics to the HTTP
  API.
- Bucket displayed ages instead of showing exact timestamps. This is enough for
  operator feedback and keeps the status bounded.
- Keep stale frames pointer-armable for now because the current MVP preserves
  the last complete frame during refresh failures. The UI clearly marks stale
  state, while runtime authorization gates still control all input.

## Risks / Trade-offs

- A stale but still displayed frame can receive explicit pointer input if the
  operator keeps pointer mode armed. Mitigation: stale state is visible in the
  same status band, and host-side pause/revoke/disconnect plus runtime input
  authorization remain authoritative.
- Client-side freshness is approximate because it measures successful browser
  replacement time, not capture time. Mitigation: the label is local freshness,
  not a capture timestamp.
