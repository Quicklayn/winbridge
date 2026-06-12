## Why

The development relay already enforces session membership, but the non-native agent-shell runtime should still fail closed when a decoded inbound protocol message carries a different `sessionId` than the local runtime. Without this local boundary, a buggy or malicious relay-like endpoint could cause host workflow handling to react to cross-session authorization messages.

## What Changes

- Ignore decoded inbound protocol envelopes whose `sessionId` does not match the local agent-shell runtime session.
- Suppress local `received` events, workflow handling, host decisions, and audit-event sends for cross-session inbound envelopes.
- Emit only secret-safe summary logging and redacted local metadata for ignored cross-session inbound messages.
- Add focused tests using a controlled WebSocket server to prove a cross-session authorization request cannot trigger host approval.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: inbound protocol messages are scoped to the local runtime session before local events or consent workflow handling.

## Impact

- Affected code: `apps/agent-shell/src/runtime.ts`.
- Affected tests: `apps/agent-shell/src/runtime.integration.test.ts`.
- Affected docs/specs: agent-shell consent workflow spec and security/architecture docs.
- Safety impact: strengthens local fail-closed handling for consent workflow inputs. This touches auth/consent workflow and logs/events. It does not add capture, input, clipboard sync, file transfer, diagnostics export, installer, startup, service, credential collection, persistence, privilege elevation, or production authorization.
