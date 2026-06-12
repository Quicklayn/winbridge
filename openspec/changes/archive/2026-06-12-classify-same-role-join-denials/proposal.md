## Why

Same-role relay join denials are currently reduced to the generic `Invalid relay message` reason in peer-facing errors and audit records. A bounded relay-defined reason code makes admission-control audits more actionable while preserving the existing two-party room safety model.

## What Changes

- Add a bounded same-role join denial reason for attempts to register a second live host or second live viewer with a different `peerId`.
- Include secret-safe audit detail metadata that classifies same-role conflicts separately from duplicate peer-id joins and pairing failures.
- Update relay integration tests to assert the explicit reason, original-peer continuity, and absence of raw pairing codes or protocol payloads.
- No multi-host, multi-viewer, reconnect, hidden-session, capture, input, token, installer, startup, service, privilege-elevation, or Windows native behavior is introduced.
- No breaking protocol message changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-broker`: same-role live join rejection uses a bounded relay-defined denial reason.
- `relay-runtime`: integration coverage proves same-role join denial audit metadata is classified and secret-safe.

## Impact

- Affected code: `apps/relay/src/rooms.ts`, `apps/relay/src/server.ts`, and `apps/relay/src/server.integration.test.ts`.
- Affected specs: `openspec/specs/session-broker/spec.md` and `openspec/specs/relay-runtime/spec.md`.
- Safety impact: strengthens relay admission-control auditability. It touches relay behavior and logs, but does not touch screen capture, remote input, clipboard, file transfer, installer behavior, startup persistence, services, privilege elevation, Windows native APIs, token matching, authentication grants, or authorization decisions.
