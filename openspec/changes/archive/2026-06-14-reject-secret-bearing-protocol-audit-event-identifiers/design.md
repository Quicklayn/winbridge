## Context

The shared audit record schema already rejects secret-bearing fixed audit identifiers before records are stored or emitted. Protocol `audit-event` envelopes are validated separately in `packages/protocol/src/messages.ts`, where fixed identifiers still use the generic protocol identifier schemas.

Development relay forwarding depends on `decodeProtocolEnvelope()` and `encodeProtocolEnvelope()`, so protocol-level validation is the narrowest place to reject unsafe audit-event identifiers before forwarding or persistence. The change is limited to protocol metadata validation and does not add remote assistance capabilities.

## Goals / Non-Goals

**Goals:**

- Reject secret-bearing marker families in protocol `audit-event` `messageId`, `sessionId`, `eventId`, and `actorPeerId`.
- Apply the same behavior when parsing inbound JSON and encoding local envelopes.
- Keep safe non-secret identifiers accepted.
- Keep diagnostics bounded so rejected raw identifiers do not appear in thrown messages or peer-facing relay reasons.
- Preserve current detail redaction, action validation, envelope immutability, and relay routing behavior.

**Non-Goals:**

- No changes to capture, input, clipboard, file transfer, diagnostics collection, installer, startup, services, or native Windows APIs.
- No changes to authorization grants, host consent decisions, session visibility, relay room membership, or pairing semantics.
- No broad change to every protocol envelope identifier in this increment.
- No production identity or account-token design.

## Decisions

1. Add audit-event-only identifier refinement in `messages.ts`.
   - Rationale: the unsafe path is specific to protocol `audit-event` envelopes, while other message types may need separate specs and compatibility review before stricter identifier semantics.
   - Alternative considered: refine `BaseMessageSchema` globally. Rejected because that would change every protocol message type and expand the blast radius beyond this OpenSpec change.

2. Reuse `hasSecretBearingProtocolIdentifierMetadata()`.
   - Rationale: the audit record layer and protocol layer should classify marker families consistently.
   - Alternative considered: duplicate the marker list in `messages.ts`. Rejected because drift would create bypasses.

3. Use bounded error text that names the audit-event identifier class, not the rejected value.
   - Rationale: validation diagnostics and relay error mapping must not echo raw token, credential, cookie, key, or authorization-like strings.
   - Alternative considered: include field-specific values in errors for debugging. Rejected because these identifiers are precisely the data being protected.

## Risks / Trade-offs

- [Risk] A development component may currently emit an audit-event identifier containing a marker word such as `token`.
  - Mitigation: safe lifecycle identifiers remain valid, and any component using secret-like text in fixed audit-event identifiers should move that text into redacted detail metadata or a non-secret opaque id.
- [Risk] Restricting only audit-event identifiers leaves other protocol message identifiers unchanged.
  - Mitigation: this keeps the increment narrow; future changes can add per-message or global rules with separate compatibility review.
- [Risk] Relay peer-facing errors might expose parser diagnostics if allowlisted too broadly.
  - Mitigation: rely on the existing generic relay rejection fallback or add only bounded allowlist text if relay behavior is explicitly changed.
