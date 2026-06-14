## Context

The viewer control prompt status command delegates to `formatViewerStatus()`, so it inherits the same bounded status rendering path as scheduled viewer status output. The previous expiration-status change covered the formatter and runtime snapshot but left the interactive viewer control prompt requirement and tests less explicit.

## Goals / Non-Goals

**Goals:**

- Pin viewer control prompt status output coverage for optional `expiresAt` on active or paused authorizations.
- Keep the status command read-only and local.
- Preserve existing omission of stale expiration metadata in inactive, remote-disconnect, local-leave, and local-socket-close snapshots.

**Non-Goals:**

- No new runtime protocol field or authorization state transition.
- No new capture, input, clipboard, file-transfer, diagnostics, reconnect, unattended, installer, startup, service, privilege, native Windows, token, or relay behavior.
- No change to authorization TTL selection or expiration scheduling.

## Decisions

- Reuse the existing viewer status formatter from the viewer control prompt.
  - Rationale: it keeps one rendering contract for viewer status lines and avoids duplicate logic.
  - Alternative considered: implement viewer-control-specific rendering. That would increase divergence and regression risk without adding value.
- Add focused prompt coverage instead of runtime changes.
  - Rationale: runtime already exposes `expiresAt` through active/paused viewer status snapshots, and the prompt already renders the formatter output.
  - Alternative considered: change runtime status shape again. That would be unnecessary and broader than the gap.

## Risks / Trade-offs

- Test-only change could look too small for an OpenSpec change. Mitigation: the affected surface is user-visible status/consent metadata, so keeping a spec delta and archive record is consistent with the project workflow.
- `expiresAt` remains an ISO timestamp rather than a countdown. Mitigation: it is stable, unambiguous, and already validated by the runtime authorization snapshot.
