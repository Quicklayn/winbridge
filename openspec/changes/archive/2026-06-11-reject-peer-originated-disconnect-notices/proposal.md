## Why

`peer-disconnected` is now a schema-valid protocol envelope, and the relay also forwards schema-valid peer messages. Without an explicit relay guard, a connected peer could send a forged `peer-disconnected` envelope through the relay. Agent shells use that lifecycle signal to fail closed, so forged notices could suppress delayed workflow simulation while the peer remains connected.

The relay must treat disconnect notices as relay-originated lifecycle events only.

## What Changes

- Reject peer-originated `peer-disconnected` messages before forwarding.
- Audit the rejection through the existing secret-safe relay message rejection path.
- Add relay integration coverage proving forged disconnect notices are not delivered.
- Document that `peer-disconnected` is relay-originated and not a peer-sendable protocol action.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-broker`: Clarifies that peer disconnect notices are relay-originated lifecycle events and peer-originated copies are rejected.
- `relay-runtime`: Adds testable rejection behavior for forged peer disconnect notices.

## Impact

- Affected code: `apps/relay`, docs, OpenSpec specs, and focused tests.
- Safety impact: prevents peers from spoofing lifecycle disconnect state.
- Touches relay, session lifecycle, and audit behavior; requires security review.
- Non-goals: reconnect policy, multi-viewer semantics, screen capture, input injection, clipboard sync, file transfer, installer behavior, services, startup persistence, credential access, privilege elevation, hidden sessions, or Windows prompt bypass.
