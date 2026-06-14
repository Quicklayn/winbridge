## Why

Device identity and pairing records can be serialized, retained in relay room state, and summarized in audit metadata, so their machine identifiers must not carry raw tokens, credentials, pairing-code labels, authorization headers, or key material. Current schemas bound the printable shape of those identifiers, but some identity and pairing ids still accept secret-bearing marker metadata.

## What Changes

- Reject secret-bearing device identity `deviceId` values before treating identity metadata as trusted peer metadata.
- Reject secret-bearing pairing ticket identifiers, session ids, host device ids, and paired-device viewer device ids before ticket creation, ticket consumption, paired-device creation, relay room registration, or trusted pairing metadata use.
- Preserve safe development device ids, UUID-style pairing ids, and existing non-secret pairing records.
- Update relay integration coverage so secret-bearing device ids fail before registration, pairing ticket creation or consumption, accepted join audit, and denied join audit.
- Update protocol identity tests and security documentation for secret-safe identity and pairing identifiers.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `identity-pairing`: Identity and pairing machine identifiers must reject secret-bearing metadata before becoming trusted pairing or relay metadata.

## Impact

- Affected code: `packages/protocol/src/identity.ts`, `packages/protocol/src/identity.test.ts`, `apps/relay/src/server.integration.test.ts`.
- Affected docs/specs: `docs/security-model.md`, `openspec/specs/identity-pairing/spec.md`.
- Touches identity and pairing validation, relay join rejection, logs/audit safety, and token/credential redaction boundaries.
- Does not touch capture, input, permission grants, host approval, production authentication, installer, startup, services, native Windows APIs, or privilege elevation.
