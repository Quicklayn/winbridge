## Why

The MVP viewer surface shows whether a frame has loaded, but it does not show
whether that frame is still being refreshed. During a two-PC trial the operator
needs bounded local feedback when the displayed frame becomes stale so they do
not mistake an old image for live state.

## What Changes

- Add local-only frame freshness metadata to the generated viewer surface UI.
- Track when the displayed frame was last replaced and show bounded
  `frameAgeMs=<bucket>` metadata.
- Mark the displayed frame as stale after a bounded local threshold without
  disabling the existing explicit disconnect/status controls.
- Keep pointer arming tied to a ready displayed frame and avoid exposing frame
  paths, frame bytes, local URLs, raw errors, tokens, pairing codes, input
  contents, authorization ids, or protocol payloads.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: extend the viewer local control surface with
  bounded local frame freshness status.

## Impact

- Affected code: `apps/agent-shell/src/viewer-local-control-surface.ts`,
  `apps/agent-shell/src/viewer-local-control-surface.test.ts`, README, and
  OpenSpec documentation.
- Affected systems: viewer-only loopback development surface.
- Safety impact: UI metadata only. This does not add capture, input,
  authorization, relay, token, audit, installer, service, startup,
  persistence, privilege, or Windows prompt behavior.
- Non-goals: no reconnect, no frame transport changes, no remote network
  probing, no native capture changes, no OS input changes, no background
  listener changes, and no production UI packaging.
