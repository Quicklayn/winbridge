## Why

The local viewer surface can show an active viewer status while the latest frame
is still unavailable. The MVP browser surface should make frame readiness clear
without exposing file paths, frame bytes, or diagnostics.

## What Changes

- Add a bounded static frame readiness indicator to the generated viewer local
  control surface HTML.
- Update browser-side frame refresh logic to report `frame=loading`,
  `frame=ready`, or `frame=not-ready` based on image load/error events.
- Add focused tests for the generated readiness indicator and handlers.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Local viewer surface readiness state must
  distinguish viewer authorization status from frame availability.

## Impact

- Affected code: `apps/agent-shell/src/viewer-local-control-surface.ts` and
  focused tests.
- Affected docs/specs: agent-shell consent workflow spec.
- APIs/dependencies: none.
- Safety impact: visible local UI feedback only. No new capture, input,
  authorization, relay, token, installer, startup, service, persistence,
  privilege, or logging behavior.
