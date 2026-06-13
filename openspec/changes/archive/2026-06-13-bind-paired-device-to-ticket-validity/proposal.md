## Why

`createPairedDevice()` records a pairing relationship from a ticket, but the helper does not itself verify that `pairedAt` falls inside the ticket's validity window. The relay currently consumes the ticket before calling the helper, but future persistence, reconnect, or identity code should not be able to create trusted pairing metadata from an expired or not-yet-valid ticket record.

## What Changes

- Require paired-device records created from pairing tickets to have `pairedAt` at or after ticket `createdAt`.
- Reject paired-device creation at or after ticket `expiresAt`.
- Keep zero-TTL pairing tickets valid for ticket creation but unusable for paired-device recording.
- Add protocol identity tests for before-created, at-created, before-expiry, and at-expiry boundaries.
- Update identity-pairing specs and docs to state that pairing relationships are ticket-validity-bound.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `identity-pairing`: Paired-device records must be created only within the source pairing ticket's validity window and remain non-authorizing.

## Impact

- Affected code: `packages/protocol/src/identity.ts`.
- Affected tests: `packages/protocol/src/identity.test.ts`.
- Affected docs/specs: `openspec/specs/identity-pairing/spec.md`, `docs/security-model.md`, `docs/architecture.md`.
- Security surface: identity/pairing metadata and future persistence/reconnect safety.
- Non-goals: no capture, input, clipboard, file transfer, diagnostics export, installer, startup, service, credential collection, stealth persistence, privilege elevation, production identity, production reconnect, or Windows prompt behavior changes.
