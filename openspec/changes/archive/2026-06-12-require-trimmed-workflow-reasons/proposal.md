## Why

Workflow reasons are carried in authorization decisions, lifecycle records, and host workflow controls. Values with leading or trailing whitespace are visually ambiguous in logs and local event summaries while still passing the current non-blank validation.

## What Changes

- Reject protocol workflow `reason` values that are not already trimmed.
- Reject shared session authorization record and state-machine transition reasons that are not already trimmed.
- Reject agent-shell CLI and direct runtime workflow reason options before relay connection or workflow message emission when they are untrimmed.
- Preserve existing reason redaction in local events, logs, and audit detail metadata.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization-protocol`: workflow reason metadata in authorization and control protocol messages must be canonical before parsing, encoding, forwarding, or local handling.
- `session-authorization`: authorization record and state-machine lifecycle reasons must be canonical before storage or action checks.
- `agent-shell-consent-workflow`: CLI/runtime workflow reason options must inherit canonical validation without weakening consent, visibility, or fail-closed gates.

## Impact

- Affected code: `packages/protocol/src/messages.ts`, `packages/protocol/src/authorization.ts`, agent-shell args/runtime validation, focused tests, docs, and OpenSpec specs.
- Affected systems: protocol metadata validation, shared authorization state machine, agent-shell CLI/runtime validation, and local event/log redaction tests.
- Safety impact: fail-closed metadata validation only. This touches authorization metadata and logs, but does not add or change screen capture, remote input, clipboard, file transfer, installer behavior, startup persistence, services, privilege elevation, Windows native APIs, token storage, or relay authentication.
