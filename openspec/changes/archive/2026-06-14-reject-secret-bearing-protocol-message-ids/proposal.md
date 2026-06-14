## Why

Protocol `messageId` is included in runtime summaries and relay accepted-forward audit detail, so it must not carry raw tokens, credentials, pairing codes, or other secret-bearing metadata. Current schemas reject secret-bearing identifiers in several fixed audit and authorization fields, but the base `messageId` field only uses the generic protocol identifier shape.

## What Changes

- Reject secret-bearing `messageId` values in the shared base protocol envelope schema for every protocol message type.
- Preserve safe UUID and existing non-secret development message identifiers.
- Add protocol tests that cover representative envelope types and verify rejection diagnostics do not expose raw secret-bearing ids.
- Add relay integration coverage showing registered peer messages with secret-bearing `messageId` are rejected before forwarding or accepted-forward audit.
- Update security documentation for secret-safe protocol message identifiers.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `protocol-identifiers`: Protocol envelope `messageId` values must reject secret-bearing metadata before parsing, encoding, forwarding, auditing, or runtime use.

## Impact

- Affected code: `packages/protocol/src/messages.ts`, `packages/protocol/src/messages.test.ts`, `apps/relay/src/server.integration.test.ts`.
- Affected verification infrastructure: `scripts/run-tests.mjs` test ordering on Windows.
- Affected docs/specs: `docs/security-model.md`, `openspec/specs/protocol-identifiers/spec.md`.
- Touches protocol validation, relay forwarding rejection, logs/audit safety, and token/credential redaction boundaries.
- Does not touch capture, input, permission grants, host approval, identity authentication, installer, startup, services, native Windows APIs, or privilege elevation.
