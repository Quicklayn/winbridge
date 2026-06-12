## Why

Signal payload safety already blocks raw remote-assistance content indicators, but the main specs and tests do not explicitly cover keylogging-related payload keys. Since keylogging is prohibited, the contract should name `keylog` / `keylogger` indicators directly and verify that they are rejected before forwarding.

## What Changes

- Make keylogging-related signal payload key rejection explicit in the protocol sensitive-key vocabulary.
- Add protocol tests for direct, decorated, nested, and array keylogging-related signal payload keys.
- Add relay integration coverage proving keylogging-related signal payloads are rejected before forwarding and are not exposed in audit records.
- Sync accepted requirements into `session-broker` and `relay-runtime` specs.
- No new remote access, input, capture, or keylogging capability is introduced.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-broker`: explicitly require signal payload rejection for keylogging-related field names at any nesting level.
- `relay-runtime`: explicitly verify relay rejection and secret-safe audit behavior for keylogging-related signal payloads.

## Impact

- Affected code: `packages/protocol/src/messages.ts`, `packages/protocol/src/messages.test.ts`, `apps/relay/src/server.integration.test.ts`.
- Affected contract: signal payload schema validation and relay rejection tests.
- Safety impact: strengthens enforcement of the no-keylogging boundary by rejecting keylogging-related payload fields before relay forwarding.
- Touches protocol validation, relay behavior tests, and audit-safety expectations; requires focused security review.
- Does not touch native Windows APIs, screen capture, input execution, clipboard/file/diagnostics collection, installer behavior, startup behavior, services, persistence, privilege elevation, authentication tokens, or production identity.
