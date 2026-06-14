## Context

The managed agent-shell runtime registers WebSocket close diagnostics for local events and disconnected logs. Viewer local leave calls `stopRuntime()` and then records `viewerLocalInactiveCause = "local-leave"`. If an optional `onEvent` close callback or disconnected logger throws during the close event, that diagnostic failure can interrupt the leave path even though the underlying operation is only local cleanup.

## Goals / Non-Goals

**Goals:**

- Make close-event diagnostics best-effort for viewer local leave cleanup.
- Preserve connection-scoped viewer authorization clearing and bounded inactive viewer status when optional diagnostics fail.
- Keep the leave path non-authorizing and free of forged lifecycle, signal, control, peer-disconnect, or workflow audit messages.

**Non-Goals:**

- No native Windows capture, input, UI, installer, service, startup, persistence, privilege, or production identity changes.
- No relay protocol change.
- No new viewer or host remote capability.

## Decisions

- Wrap close-event diagnostic emission and disconnected logging in best-effort helpers.
  - Rationale: close diagnostics are observability, while local cleanup and status state are safety behavior.
  - Alternative considered: surface diagnostic callback/logger errors from `leave()`. Rejected because it makes local cleanup depend on optional observers and can leave status less predictable.
- Keep cleanup ordering ahead of diagnostics.
  - Rationale: `localPeerDisconnected`, signal invalidation, viewer socket-close status recording, and host indicator deactivation must remain local state cleanup, not diagnostic side effects.
  - Alternative considered: add a viewer-leave-specific close listener. Rejected because it duplicates the existing close path and risks diverging socket-close semantics.
- Continue relying on the relay for peer-disconnect notification.
  - Rationale: the viewer runtime must not forge `peer-disconnected`; the relay observes the socket close and notifies the host.

## Risks / Trade-offs

- [Risk] Swallowing diagnostic errors can hide broken test callbacks or loggers.
  - Mitigation: limit best-effort handling to optional close diagnostics and add regression coverage that still verifies cleanup and absence of forged protocol messages.
- [Risk] A broad close handler change affects host close logging as well as viewer leave.
  - Mitigation: preserve existing state cleanup and event shape; only prevent optional diagnostic/log callback failures from escaping the close handler.
