## Context

The agent shell already supports a static viewer signal probe and optional host acknowledgement. Both use the public runtime signal gates and redacted signal event surfaces. Viewer status currently reports lifecycle metadata such as state, visibility, permission count, authorization metadata, remote disconnect reason code, and local inactive cause, but it does not report whether the host acknowledgement arrived.

## Goals / Non-Goals

**Goals:**

- Record a viewer-local acknowledgement marker only after receiving a trusted host `signal` whose payload has the static host acknowledgement marker and matching authorization id.
- Expose the marker as bounded status metadata, not raw signal payload data.
- Omit stale acknowledgement metadata when active visible `screen:view` authorization is lost or the viewer connection becomes inactive.
- Keep status reads read-only and non-authorizing.

**Non-Goals:**

- No WebRTC SDP, ICE, media transport, screen capture, input, clipboard, file transfer, diagnostics, reconnect, installer, startup, service, privilege, native Windows, or production identity capability.
- No new protocol message type or relay routing behavior.
- No raw signal payload marker, peer id, display name, private reason, token, pairing code, screen contents, input contents, clipboard contents, file-transfer data, diagnostics dump, or close reason in viewer status output.

## Decisions

- Store only a viewer-local `viewerSignalProbeAckAuthorizationId`.
  - Rationale: the authorization id is already non-secret lifecycle metadata and lets the runtime avoid stale status for another authorization.
  - Alternative considered: store the raw acknowledgement payload. That would widen the status surface and violate signal redaction.
- Expose `signalProbeAckReceived=true` only while the viewer status is active for the same authorization id.
  - Rationale: pause, revoke, termination, expiration, disconnect, local leave, and socket close all make signaling unavailable or inactive; stale ack history should not imply current readiness.
  - Alternative considered: expose historical ack status while paused or inactive. That could be misread by future UI as current signal readiness.
- Keep the CLI output as one optional key in the existing viewer status line.
  - Rationale: existing status output is compact key/value metadata; adding one bounded boolean follows the local pattern.

## Risks / Trade-offs

- A status bit may be mistaken for permission to start capture. Mitigation: it is emitted only by viewer status, does not grant permissions, and specs/tests state it cannot authorize capture, input, clipboard, file transfer, diagnostics, reconnect, or host controls.
- Stale acknowledgement metadata could survive lifecycle changes. Mitigation: implementation clears ack state through the same lifecycle invalidation paths that cancel pending probes, and integration tests cover pause/loss behavior.
