## Why

`authorizationId` is preserved as non-secret lifecycle metadata in protocol messages, relay forwarding audit records, status surfaces, and CLI workflows. Today those fields use the generic protocol identifier schema, so schema-valid strings containing token, credential, cookie, API key, access-key, private-key, SSH-key, authorization-header, or auth-header markers can be accepted and later treated as safe correlation metadata.

## What Changes

- Reject secret-bearing `authorizationId` values at the protocol/state-machine boundary instead of redacting them later.
- Apply the non-secret authorization id contract to authorization records, authorization lifecycle protocol messages, session-control messages, permission-revoked messages, and `signal.payload.authorizationId`.
- Keep valid non-secret authorization identifiers accepted and inspectable in existing audit/status correlation surfaces.
- Add protocol and relay tests proving secret-bearing authorization ids fail closed before forwarding or audit persistence can expose the raw value.
- Non-goals: no changes to host consent, active-session visibility, capture, input, clipboard, file transfer, installer behavior, startup persistence, services, privilege elevation, or Windows security prompts.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `session-authorization`: Authorization records reject secret-bearing authorization identifiers before any remote action check can use them.
- `session-authorization-protocol`: Authorization lifecycle and control protocol envelopes reject secret-bearing authorization identifiers before forwarding or workflow processing.
- `session-broker`: Signal payload validation treats secret-bearing `authorizationId` values as malformed while continuing to allow non-secret lifecycle identifiers.
- `audit-foundation`: Audit detail redaction preserves non-secret `authorizationId` values but redacts secret-bearing authorization identifier values before local storage or protocol forwarding.
- `relay-runtime`: Relay integration coverage proves secret-bearing authorization identifiers are rejected with bounded secret-safe diagnostics before forwarding.

## Impact

- Affected code: `packages/protocol` schemas and tests, development relay integration tests, and any non-native agent-shell argument path that parses externally supplied authorization ids.
- Affected surfaces: auth, relay, audit/log correlation, protocol validation.
- Unaffected surfaces: native Windows capture/input, hidden-session behavior, installer/startup/services, credential access, AV/EDR interactions, and privilege elevation.
