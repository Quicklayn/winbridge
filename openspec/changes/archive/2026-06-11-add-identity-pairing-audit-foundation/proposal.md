## Why

The relay currently accepts peers with only role, peer id, session id, and pairing code. Before native remote-control features exist, the project needs a reusable foundation for device identity, expiring pairing material, and structured audit records.

## What Changes

- Add protocol schemas for local device identity and pairing tickets that do not persist raw pairing codes.
- Add protocol schemas for structured audit records tied to actors, sessions, actions, and outcomes.
- Add a reusable audit-log package with in-memory and console sinks for development.
- Add relay audit hooks for token rejection, join success/failure, invalid messages, forwarded messages, and disconnects.
- Add agent-shell device identity metadata to join messages.
- Keep this as a development foundation, not production account authentication.

Safety impact:

- This change touches authentication/authorization foundations, relay behavior, tokens, and logs.
- It does not add screen capture, input control, clipboard, file transfer, installer behavior, startup behavior, services, privilege elevation, or unattended access.
- It reinforces consent and audit boundaries without enabling hidden sessions.

## Capabilities

### New Capabilities
- `identity-pairing`: Local device identity and expiring pairing-ticket contracts used before a viewer can join a session.
- `audit-foundation`: Structured audit records and development sinks for security-relevant session events.

### Modified Capabilities

None.

## Impact

- Updates `packages/protocol` exports and message schemas.
- Adds `packages/audit-log`.
- Updates `apps/relay` to emit development audit records.
- Updates `apps/agent-shell` to include local device identity in join metadata.
- Adds focused unit tests for identity, pairing, audit schema, and audit sinks.
