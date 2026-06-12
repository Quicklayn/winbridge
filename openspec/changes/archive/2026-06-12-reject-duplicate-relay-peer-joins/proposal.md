## Why

The development relay currently allows a new socket to join with the same live `peerId` and role as an already registered peer, replacing the peer send path and allowing a host duplicate join to refresh pairing material. A two-party consent-first relay should treat live peer identity as exclusive until disconnect cleanup runs.

## What Changes

- Reject a join attempt when the same session already has a live registered peer with the same `peerId`.
- Ensure a rejected duplicate join does not replace the existing peer send function, change room membership, recreate host pairing tickets, or consume viewer pairing tickets.
- Return and audit only bounded metadata for duplicate-join denial.
- Update relay pairing/session specs and docs to document live peer identity exclusivity.
- Non-goals: production account identity, reconnect/resume semantics, multi-viewer rooms, native Windows capture, remote input, installer behavior, startup persistence, services, or privilege elevation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `session-broker`: make live peer ids exclusive within a session room until disconnect cleanup.
- `identity-pairing`: ensure duplicate host/viewer joins cannot replace peer identity or mutate pairing ticket state.
- `relay-runtime`: add test coverage for duplicate live peer join rejection and secret-safe diagnostics.

## Impact

- Affected code: `apps/relay/src/rooms.ts`, `apps/relay/src/rooms.test.ts`, and relay integration tests.
- Affected docs: `docs/architecture.md`, `docs/security-model.md`, and possibly `README.md`.
- Affected systems: development relay join/registration boundary, pairing-ticket mutation path, join-denial audit records.
- Safety impact: prevents live peer takeover/identity replacement in the development relay without granting any remote capability.
