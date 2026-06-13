## Context

The relay writes accepted join audit records with `sessionId` and a peer-attributed actor id through `writeRelayAudit`. Denied joins currently emit `relay.peer.join.denied` with a bounded reason and pairing-safe detail, but omit `sessionId` and attempted `peerId` even when the denied message has already decoded as a valid `join-session` envelope.

## Goals / Non-Goals

**Goals:**

- Attribute decoded `join-session` denials to the attempted `sessionId` and `peerId` when those identifiers do not contain the submitted pairing code.
- Replace pairing-code-bearing attempted identifiers with bounded redaction metadata.
- Reuse existing relay audit actor bounding so long peer ids remain hash-bounded.
- Keep denial details free of raw pairing codes, shared tokens, credentials, protocol payloads, and remote-assistance content.
- Cover missing-ticket and duplicate-peer denial cases through integration tests.

**Non-Goals:**

- No new protocol fields, relay forwarding changes, pairing ticket lifecycle changes, token semantics, or production identity model.
- No capture, input, clipboard, file transfer, diagnostics collection, reconnect behavior, installer/startup/service changes, privilege elevation, hidden sessions, or consent bypass.
- No attribution for malformed pre-decode messages, because their identifiers have not been validated.

## Decisions

1. Attribute only decoded `join-session` denial audit records.

   Rationale: after protocol decode, `sessionId` and `peerId` have passed schema validation, but they are still unauthenticated until registration succeeds. They are safe to record directly only when they do not contain the submitted pairing code. Malformed or non-join messages should keep the existing relay actor because they do not have validated join identity.

   Alternative considered: parse identifiers from malformed input for better diagnostics. That would risk logging unvalidated data and raw protocol fragments.

2. Use `writeRelayAudit` `sessionId` and `peerId` inputs only for direct safe identifiers, and omit unsafe attempted identifiers from direct attribution.

   Rationale: top-level audit `sessionId` and actor id are not key-redacted. If a denied client copies the pairing code into `sessionId` or `peerId`, direct attribution would persist a raw pairing code. A bare hash of a 6-digit pairing-code-bearing identifier is also too easy to brute force, so unsafe identifiers get only boolean and length redaction metadata.

   Alternative considered: always omit denied join identifiers. That would avoid leakage but lose useful audit correlation for normal safe identifiers.

3. Keep pairing classification unchanged.

   Rationale: the existing `pairingDeniedAuditDetail` output gives safe denial classification without raw pairing material, and this change only improves attribution.

## Risks / Trade-offs

- Risk: denied join audit records become more specific and easier to correlate.
  Mitigation: session ids and peer ids are protocol-facing bounded identifiers already used in accepted audit records; raw pairing codes and tokens remain excluded.
- Risk: malformed input remains unattributed.
  Mitigation: fail-closed malformed-message audit continues to use bounded reasons without unvalidated data.
