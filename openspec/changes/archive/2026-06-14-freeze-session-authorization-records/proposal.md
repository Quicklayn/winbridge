## Why

Session authorization records are validated before use, but the returned JavaScript objects and nested permission arrays are currently mutable. Future host/viewer adapters can accidentally widen a validated grant, flip visibility, or rewrite lifecycle state after validation but before enforcement.

## What Changes

- Return immutable authorization snapshots from the shared session authorization state machine.
- Freeze nested authorization data, including the permission list, after schema validation.
- Add regression coverage proving callers cannot mutate returned grant scope, lifecycle status, or host visibility.
- Preserve all existing consent, visibility, revocation, pause, termination, expiration, and schema validation behavior.
- Non-goal: add no new remote action permission, capture, input, relay, installer, startup, service, token, logging, or privilege-elevation capability.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization`: authorization state-machine outputs become immutable snapshots after validation.

## Impact

- Affected code: `packages/protocol/src/authorization.ts` and `packages/protocol/src/authorization.test.ts`.
- API shape remains source-compatible for readers, but callers that mutate returned authorization objects will fail instead of silently changing safety-critical state.
- No dependency, transport, protocol envelope, installer, service, native Windows API, capture, input, or persistence changes.
