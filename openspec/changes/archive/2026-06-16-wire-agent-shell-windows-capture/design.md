## Context

The agent shell already validates and sends `screen-frame` messages after
active visible authorization. A separate `@winbridge/windows-capture` package can
produce bounded PNG frames, but it must not be called from public status data
because host status intentionally exposes only permission counts, not the actual
grant list. Native capture needs to live behind the runtime's internal
authorization state.

## Goals / Non-Goals

**Goals:**

- Add an explicit host-only CLI source value: `--dev-screen-frame-source windows-capture`.
- Add a runtime method that uses internal host authorization permissions to
  build the capture grant.
- Write metadata-only audit before invoking native capture and block capture if
  that audit write fails.
- Convert the capture result into the existing `screen-frame` message path, so
  existing send authorization, audit-before-send, redaction, and socket checks
  still apply.
- Cover one-shot, finite stream, authorization loss, audit failure, capture
  failure, and redaction behavior with tests that mock the capture adapter.

**Non-Goals:**

- No viewer desktop renderer.
- No OS input application.
- No hidden capture, unattended access, services, startup persistence, installer
  behavior, elevation, AV/EDR evasion, or Windows prompt bypass.
- No WebRTC media pipeline or quality controls.

## Decisions

1. Capture through a runtime method, not from CLI status snapshots.

   The public host status snapshot does not expose permission names. Constructing
   a fake `screen:view` grant in CLI code would risk native capture when an
   active visible authorization exists without that permission. The runtime
   method has access to internal `hostAuthorization.permissions` and can enforce
   the real grant.

2. Audit before capture, then send through the existing screen-frame method.

   Native capture is a sensitive side effect, so local audit persistence must
   happen before the adapter runs. The actual remote frame send still goes
   through `sendDevelopmentScreenFrame()`, preserving existing routing,
   authorization, audit-before-send, redaction, and socket behavior.

3. Make scheduler capture attempts asynchronous and non-overlapping.

   Captures can take longer than a timer interval. The Windows capture scheduler
   waits for each capture/send attempt to finish before scheduling the next
   attempt, and stops on authorization loss, capture failure, runtime rejection,
   local stop, disconnect, or configured count completion.

## Risks / Trade-offs

- Capture can occur shortly before a concurrent revoke reaches the local runtime
  -> send is rechecked after capture and fails before socket write; future UI
  work should make revoke propagation tighter.
- PowerShell capture is not a production media path -> acceptable for MVP
  bootstrap; later media work can replace the adapter without changing consent
  gates.
- Real screen bytes enter process memory -> diagnostics and audit remain
  metadata-only, and bytes are sent only through the existing authorized
  `screen-frame` path.
