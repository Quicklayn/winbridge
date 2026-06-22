# show-viewer-surface-signal-ack

## Why

The MVP command plan now enables the existing viewer signal probe and host
acknowledgement path. The loopback viewer surface should expose the resulting
bounded `signalProbeAckReceived=true` status metadata so a developer can see
that the consent-bound signaling readiness path is alive before using remote
control.

## What Changes

- Display signal acknowledgement readiness in the generated local viewer page
  when the sanitized viewer status includes `signalProbeAckReceived=true`.
- Keep the status bounded and non-authorizing.
- Do not expose raw signal payloads, peer ids, display names, tokens, pairing
  codes, authorization ids, or private reasons in the page.

## Impact

- Affected spec: `agent-shell-consent-workflow`
- Affected code: `apps/agent-shell/src/viewer-local-control-surface.ts`
- Affected tests: `apps/agent-shell/src/viewer-local-control-surface.test.ts`
