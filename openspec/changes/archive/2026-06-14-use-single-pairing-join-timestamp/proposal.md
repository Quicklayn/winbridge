## Why

Viewer pairing in the development relay currently asks the room clock separately for ticket consumption and paired-device recording. Near a ticket expiration boundary, those two reads can disagree, producing a nondeterministic denial after the credential check passed.

## What Changes

- Use one relay pairing decision timestamp for both viewer ticket consumption and paired-device record creation.
- Add regression coverage proving a viewer accepted just before expiry is recorded with the same timestamp, even if the injected clock advances before the next call.
- Preserve existing TTL, max-use, self-pairing, duplicate-peer, same-role, host-created-ticket, and secret-safe audit behavior.
- Non-goal: add no capture, input, clipboard, file transfer, diagnostics payload, reconnect, hidden session, unattended access, installer, startup, service, credential, token, logging sink, or privilege-elevation capability.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-broker`: viewer pairing acceptance and paired-device recording use a single relay decision timestamp.

## Impact

- Affected code: `apps/relay/src/rooms.ts` and `apps/relay/src/rooms.test.ts`.
- Affected specs: `openspec/specs/session-broker/spec.md`.
- The change touches relay pairing behavior and audit-relevant membership state only. It does not touch native Windows APIs, screen capture, remote input, installer behavior, startup behavior, services, tokens, credentials, privilege elevation, or production authorization.
