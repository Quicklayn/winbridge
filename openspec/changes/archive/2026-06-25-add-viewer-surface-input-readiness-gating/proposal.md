## Why

The local MVP viewer surface currently lets the operator click input controls
even while the viewer is not active or no displayed frame is ready. Runtime
authorization still rejects unsafe sends, but the MVP demo needs clearer local
readiness cues before the operator attempts control.

## What Changes

- Add client-side input readiness state to the generated viewer surface.
- Disable manual send, explicit key buttons, modifier toggles, and pointer
  arming until the page has both active visible viewer status and a ready
  displayed frame.
- Keep server-side runtime authorization, permission, audit, routing, and
  redaction gates authoritative for every input request.
- Keep local status output bounded and free of authorization ids, paths, frame
  bytes, raw command text, tokens, pairing codes, credentials, and private
  reasons.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: extend the viewer local control surface with
  local input-readiness gating for visible controls.

## Impact

- Affected code: `apps/agent-shell/src/viewer-local-control-surface.ts`,
  `apps/agent-shell/src/viewer-local-control-surface.test.ts`, README, and
  OpenSpec documentation.
- Affected systems: viewer-only loopback development surface UI.
- Safety impact: UI affordance hardening only. No new remote input capability,
  capture behavior, authorization behavior, audit format, relay behavior,
  token handling, installer, service, startup, privilege elevation, or Windows
  prompt behavior.
- Non-goals: no production UI framework, no OS-level input changes, no
  permission expansion, no reconnect, no clipboard/file/diagnostics features,
  and no unattended operation.
