## Context

The relay already redacts sensitive audit detail fields and bounds oversized relay peer actor ids. However, relay audit attribution still treats schema-valid protocol identifiers as safe by default. Protocol identifiers can legally contain colon-separated strings, so values like `token:raw-secret`, `cookie:raw-secret`, or `sshKey:raw-secret` pass identifier validation and can appear in audit `sessionId`, relay actor ids, `deviceIdentity.deviceId`, or recipient routing metadata.

This change is scoped to audit projection. The relay must continue using the original identifiers for room lookup, pairing tickets, WebSocket routing, and protocol validation.

## Goals / Non-Goals

**Goals:**

- Reuse the shared audit secret-metadata detector for relay audit identifier projection.
- Redact secret-bearing session ids before they reach top-level audit `sessionId`.
- Redact secret-bearing peer ids before they reach relay actor ids or forwarded recipient audit metadata.
- Redact secret-bearing device ids in accepted and denied join identity audit detail.
- Preserve existing readable audit metadata for safe identifiers.

**Non-Goals:**

- No changes to protocol identifier validation.
- No changes to room membership, pairing, forwarding, consent, authorization, capture, input, reconnect, or session lifecycle semantics.
- No storage of raw secret-bearing identifiers in alternate audit fields.
- No new production authentication or authorization model.

## Decisions

1. **Centralize actor/session projection in the relay audit wrapper.**
   - `writeRelayAudit` is the final relay-owned boundary before audit records enter sinks, so it should omit top-level secret-bearing `sessionId` and avoid readable actor ids for secret-bearing `peerId`.
   - Alternative considered: update each relay call site. That is easier to miss as new audit events are added.

2. **Use bounded redaction metadata, not hashes, for secret-bearing identifiers.**
   - Existing overlong peer ids use a hash for deterministic bounded actor ids. Secret-bearing identifiers are different because short secrets can be brute-forced from hashes.
   - Redacted secret-bearing identifiers should expose only booleans and lengths, using a generic bounded actor id.

3. **Keep forwarding and join identity detail explicit.**
   - `acceptedForwardAuditDetail` and join identity projection already build explicit allowlisted detail objects. They should continue doing that and replace unsafe identifier fields with redaction metadata.
   - Alternative considered: rely only on shared audit detail key redaction. That does not catch a secret stored in a non-sensitive key like `recipientPeerId` or `deviceId`.

## Risks / Trade-offs

- Reduced audit correlation for peers that choose secret-bearing identifiers -> Preserve safe identifiers and include bounded redaction metadata for unsafe ones.
- Incomplete secret pattern detection -> Reuse the shared audit detector already used for audit actions and reasons, and cover common token, credential, cookie, API key, access key, private key, SSH key, and authorization header markers in tests.
- Future audit call sites may add raw identifier fields under new key names -> Keep relay audit projection helpers close to the explicit detail builders and add tests for accepted joins, denied joins, and forwarding.
