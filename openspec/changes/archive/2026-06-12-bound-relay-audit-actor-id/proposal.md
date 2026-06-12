## Why

Relay audit records use `actor.id` values such as `development-relay:<peerId>`, but a valid protocol `peerId` can be 128 characters long. Prefixing such an id can exceed the audit actor identifier limit and make otherwise valid relay events fail audit schema validation.

## What Changes

- Bound relay audit actor identifiers when a peer id would make `development-relay:<peerId>` exceed the protocol identifier limit.
- Preserve existing actor ids for short peer ids.
- Add deterministic secret-safe hash metadata for overlong peer actor ids instead of embedding the full peer id in `actor.id`.
- Add unit and relay integration tests covering max-length valid peer ids.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `audit-foundation`: require relay audit actor ids to remain schema-valid for valid protocol peer ids.
- `relay-runtime`: require relay audit records for max-length peer ids to be emitted without throwing and without raw pairing material.

## Impact

- Affected code: `apps/relay/src/audit.ts`, `apps/relay/src/audit.test.ts`, `apps/relay/src/server.integration.test.ts`.
- Affected contract: relay audit actor metadata for peer ids that exceed the actor id budget after prefixing.
- Safety impact: improves audit reliability and prevents valid peer joins/messages from losing audit records due to actor id length.
- Touches audit/logging and relay behavior; requires focused security review.
- Does not touch screen capture, input execution, keylogging, clipboard/file/diagnostics collection, installer behavior, startup behavior, services, persistence, privilege elevation, auth token validation, or native Windows APIs.
