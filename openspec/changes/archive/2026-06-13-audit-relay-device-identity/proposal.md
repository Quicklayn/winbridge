## Why

Accepted relay joins are security-relevant events, but the current audit detail only records pairing lifecycle flags and room size. Operators need bounded device identity attribution to distinguish host/viewer devices during development investigations without exposing display names, pairing codes, tokens, or protocol payloads.

## What Changes

- Add bounded device identity metadata to `relay.peer.join.accepted` audit detail when a peer presents schema-valid `deviceIdentity`.
- Include only non-secret fields: `deviceId`, `platform`, `trustLevel`, and `createdAt`.
- Omit raw display-name metadata from accepted join audit records.
- Keep the metadata non-authorizing: pairing remains only a join prerequisite and does not grant screen, input, clipboard, file, diagnostics, reconnect, hidden session, or consent bypass permissions.
- Add integration coverage for accepted host/viewer joins and secret-safe audit output.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `relay-runtime`: accepted peer join audit records include bounded device identity metadata when valid identity is supplied, while remaining secret-safe and non-authorizing.

## Impact

- Touches relay and logs/audit behavior.
- Affected code: `apps/relay/src/server.ts` and relay integration tests.
- No capture, input, installer, startup, service, token, privilege elevation, or native Windows API changes.
- No new runtime dependency and no wire protocol breaking change.
