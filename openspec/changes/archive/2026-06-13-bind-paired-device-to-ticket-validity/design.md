## Context

Pairing is a prerequisite identity relationship for the development relay. It is intentionally not authorization for screen viewing, input, clipboard, file transfer, diagnostics, reconnect, hidden sessions, or consent bypass. The relay consumes a host-created pairing ticket before recording a paired device, but the shared protocol helper is also part of the future persistence/reconnect surface.

## Goals / Non-Goals

**Goals:**

- Fail closed when `createPairedDevice()` is called with `pairedAt` before the ticket `createdAt`.
- Fail closed when `createPairedDevice()` is called with `pairedAt` at or after the ticket `expiresAt`.
- Preserve valid pair creation at ticket `createdAt` and just before ticket expiration.
- Keep zero-TTL tickets representable but unusable for pair recording, matching existing expiration semantics.
- Keep errors generic and free of raw pairing codes or device metadata.

**Non-Goals:**

- No production device trust, durable account binding, reconnect semantics, or identity migration.
- No relay room behavior change beyond using the hardened helper it already calls.
- No new remote capability and no change to consent, visibility, revocation, or action authorization gates.

## Decisions

- Validate the source ticket with `PairingTicketSchema.parse()` inside `createPairedDevice()`.
  - Rationale: this keeps the helper robust if callers pass deserialized or future persisted ticket records.

- Treat the valid pairing window as inclusive at `createdAt` and exclusive at `expiresAt`.
  - Rationale: existing expiration checks reject `Date.parse(expiresAt) <= now`, so `pairedAt === expiresAt` must fail.

- Use generic error messages without interpolating ticket ids, device ids, pairing codes, or timestamps.
  - Rationale: pairing failure diagnostics must not leak secrets or private metadata into logs.

## Risks / Trade-offs

- [Risk] Tests or tools that directly call `createPairedDevice()` with an expired fixture will now fail. -> Mitigation: those callers should model a valid ticket window explicitly.
- [Risk] This does not create production identity assurance. -> Mitigation: docs/specs keep pairing non-authorizing and mark production identity as future work.
- [Risk] This touches identity/pairing behavior. -> Mitigation: run focused identity tests, full gates, strict OpenSpec validation, and a security review.
