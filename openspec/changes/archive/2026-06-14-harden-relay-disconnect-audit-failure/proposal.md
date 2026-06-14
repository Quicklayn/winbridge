## Why

Relay disconnect cleanup sends bounded `peer-disconnected` notices, removes stale room membership, and may close orphaned peers before writing the `relay.peer.disconnect` audit record. If that post-cleanup audit write or diagnostic logging fails, the relay should not crash or weaken cleanup guarantees that keep stale peers from interacting with replacement sessions.

## What Changes

- Add bounded handling for `relay.peer.disconnect` audit persistence failures after close cleanup.
- Preserve disconnect notification, stale viewer removal, orphan close, and reason-code behavior when post-cleanup audit persistence fails.
- Emit only static, secret-safe diagnostics for disconnect audit persistence failure.
- Add regression coverage for audit sink and diagnostic logger failures in the disconnect close path.
- Update security documentation to describe disconnect cleanup as authoritative even when post-cleanup audit diagnostics fail.
- Non-goals: no capture, input, clipboard, file transfer, installer, service, startup persistence, privilege elevation, credential access, hidden session behavior, reconnect semantics, or bypass of consent/authorization workflows.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `relay-runtime`: add runtime requirements for post-cleanup disconnect audit failure handling and bounded diagnostics.

## Impact

- Affected code: `apps/relay/src/server.ts`, `apps/relay/src/server.integration.test.ts`.
- Affected docs/specs: `docs/security-model.md`, `openspec/specs/relay-runtime/spec.md`.
- Security scope: touches relay cleanup, audit, and logs. Requires security review.
- API/dependency impact: no protocol schema changes, no public API changes, no new dependencies.
