## Context

The development relay accepts an initial `join-session` envelope, validates it through the protocol schema, creates or consumes pairing material, and emits `relay.peer.join.accepted`. Existing audit detail covers role, room size, and pairing ticket state, but does not expose safe device identity metadata that can help investigate which development device joined a session.

The `DeviceIdentitySchema` already validates `deviceId`, `displayName`, `platform`, `trustLevel`, and `createdAt`. Display names are user-controlled and already treated as private audit detail by the shared audit layer, so the relay must not add display names to accepted join audit detail.

## Goals / Non-Goals

**Goals:**

- Include bounded, schema-validated identity metadata in accepted relay join audit detail when the peer supplied `deviceIdentity`.
- Preserve existing pairing, room registration, and message forwarding behavior.
- Keep accepted join audit records free of raw pairing codes, display names, tokens, credentials, protocol payloads, keystrokes, screenshots, screen contents, and full secrets.
- Add focused integration tests for host and viewer accepted joins.

**Non-Goals:**

- No production account authentication, device attestation, trust promotion, or MFA.
- No change to host consent, authorization grants, capture, input, clipboard, file transfer, diagnostics, reconnect, or native Windows APIs.
- No audit of raw user display names.

## Decisions

- Add relay audit metadata from the parsed `join-session` envelope, after protocol validation and successful room registration. This uses already-validated data and avoids trusting raw JSON.
- Store metadata under a dedicated `deviceIdentity` detail object with only `deviceId`, `platform`, `trustLevel`, and `createdAt`. This keeps display names out of audit records while retaining enough attribution to correlate joins.
- Do not add device identity data to `RelayPeer` or room state. Room pairing already only needs the `deviceId`, and retaining display-name-capable objects would increase the chance of accidental logging.
- Keep the absence of `deviceIdentity` valid for legacy development callers. When omitted, accepted join audit detail remains unchanged except for existing pairing fields.

## Risks / Trade-offs

- Device ids are local development identifiers, not production-authenticated identities -> Mitigation: document and test that the metadata is non-authorizing and does not grant permissions.
- Audit detail size increases slightly -> Mitigation: fields are bounded by existing protocol schemas and only present when supplied.
- Future trust semantics may change -> Mitigation: preserve the `trustLevel` value exactly as validated, but do not branch authorization behavior on it in this change.
