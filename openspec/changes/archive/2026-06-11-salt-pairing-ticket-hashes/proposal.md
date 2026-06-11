## Why

Pairing tickets currently store `sha256(pairingCode)` without per-ticket salt. This avoids raw pairing code storage, but identical pairing codes produce identical ticket hashes across sessions. Since the development code is intentionally short for local testing, serialized tickets and audit-adjacent metadata should not reveal stable hash equality.

Adding a per-ticket salt improves the identity/pairing foundation without granting remote access or changing host consent requirements.

## What Changes

- Add a per-ticket pairing-code salt to `PairingTicket`.
- Hash pairing codes with the ticket salt when tickets are created and consumed.
- Ensure tickets created for the same pairing code have different hashes.
- Keep raw pairing codes out of tickets, relay peer state, audit output, and logs.
- Update docs and specs to describe salted development pairing hashes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `identity-pairing`: Pairing tickets store salted pairing-code hashes.

## Impact

- Affected code: `packages/protocol`, relay pairing tests through shared protocol behavior, docs, and OpenSpec specs.
- Safety impact: reduces stable secret-derived metadata in serialized pairing tickets while preserving consent-first semantics.
- Touches identity, pairing material, token/secret handling, and logs/audit expectations; requires security review.
- Non-goals: production account authentication, reconnect policy, screen capture, input injection, clipboard sync, file transfer, installer behavior, services, startup persistence, credential access, privilege elevation, hidden sessions, or Windows prompt bypass.
