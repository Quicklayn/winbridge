## Context

The runtime records trusted `peer-disconnected` notices in `sessionState.remotePeerDisconnected`. Public sends and delayed host workflow already fail closed after that state. The viewer status snapshot, however, currently derives only from `sessionState.viewerAuthorization`, so after a host disconnect an already active viewer can still report `state: "active"` until another lifecycle event arrives.

## Goals / Non-Goals

**Goals:**

- Make `getViewerStatus()` return inactive local status when a viewer has recorded trusted remote peer disconnected state.
- Preserve the last bounded authorization id/status when one exists so development UI can correlate what became disconnected.
- Return `visibleToHost: false` and `permissionCount: 0` after disconnect.
- Verify the status read remains read-only and sends no messages.

**Non-Goals:**

- No change to authorization lifecycle records, protocol envelopes, relay behavior, reconnect behavior, host controls, or audit persistence.
- No viewer-side session termination authority.
- No screen capture, input, clipboard, file transfer, diagnostics, installer/startup/service, token, authentication, or privilege behavior.

## Decisions

1. Treat remote disconnect as a presentation overlay, not a new authorization status.

   The protocol already has terminal authorization statuses such as `terminated`, `revoked`, and `expired`. A transport disconnect is not one of those statuses and should not mutate the last authorization record. The viewer snapshot can still report inactive local state while preserving optional authorization metadata.

   Alternative considered: rewrite the viewer authorization status to `terminated`. Rejected because host termination is an explicit lifecycle authority message, while relay disconnect is transport lifecycle.

2. Scope the behavior to viewer status only.

   Host indicator deactivation on trusted viewer disconnect is already implemented separately. This change only closes the viewer UI metadata gap.

   Alternative considered: add a generic disconnected status enum. Rejected for this increment because existing snapshot state is intentionally bounded to `active`, `paused`, and `inactive`.

## Risks / Trade-offs

- [Risk] Inactive status after disconnect could hide the last authorization status. -> Mitigation: keep optional authorization id/status when a previous viewer authorization exists.
- [Risk] A future caller could treat inactive status as host denial or termination. -> Mitigation: docs/spec distinguish transport disconnect from authorization lifecycle changes.
- [Risk] Status reads could accidentally emit events while checking disconnect state. -> Mitigation: implementation remains a pure snapshot read and tests assert sent event counts.
