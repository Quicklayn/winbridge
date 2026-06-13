## Context

Development pairing tickets store `sha256:` hashes of host-created pairing codes and reject viewer joins when the candidate code does not match. Because that comparison is derived from a joining credential, the check should avoid data-dependent string-comparison behavior once both hashes are validated as fixed-format SHA-256 values.

## Goals / Non-Goals

**Goals:**

- Use Node's built-in constant-time byte comparison for fixed-length pairing-code hashes.
- Keep the existing pairing ticket schema, salted hash format, expiration behavior, use-count behavior, and relay join outcomes.
- Keep rejection errors bounded and free of raw pairing codes or hash material.

**Non-Goals:**

- No change to pairing-code format, ticket storage format, relay room semantics, authentication model, authorization grants, audit schema, or deployment configuration.
- No new screen capture, input, clipboard, file transfer, diagnostics, reconnect, native Windows, installer, startup, service, persistence, token, or privilege capability.

## Decisions

- Validate both stored and candidate hashes with the existing `PairingTicketSchema` and `hashPairingCode` format before comparing. This keeps malformed ticket data rejected before any trust decision.
- Compare only the 32-byte hex digest body after the `sha256:` prefix has been validated. The digest length is fixed, so `timingSafeEqual` can be used without length-based early mismatch for valid hashes.
- Keep `consumePairingTicket` as the enforcement point. Relay joins already call this helper, so the relay inherits the stronger comparison without duplicating credential logic.

## Risks / Trade-offs

- [Risk] Constant-time behavior is difficult to prove with unit tests. -> Mitigation: cover observable accept/reject behavior in tests and require security review of the implementation path.
- [Risk] Malformed stored ticket hashes could reach the compare helper if validation order changes later. -> Mitigation: keep schema parsing before comparison and add a focused malformed-hash regression test.
