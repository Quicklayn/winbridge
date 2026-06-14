## Context

The shared audit factory validates fixed audit fields before records reach in-memory, console, or file sinks. Existing validation already handles unsafe action, reason, target type, detail redaction, participant device ids, and infrastructure actor device ids. Fixed identifier fields still rely on protocol identifier shape only.

## Goals / Non-Goals

**Goals:**

- Reject token-, credential-, cookie-, key-, secret-, pairing-code-, and authorization-shaped metadata in `eventId`, `actor.id`, `sessionId`, and `target.id`.
- Keep non-secret audit identifiers valid.
- Keep validation errors bounded and free of raw rejected identifier values.

**Non-Goals:**

- No changes to relay-specific redaction of peer/session identifiers before calling the shared audit layer.
- No changes to audit detail redaction, protocol message forwarding, pairing, authorization, capture, input, clipboard, file transfer, diagnostics, installer, startup, services, token transport, or privilege behavior.
- No new production identity model.

## Decisions

- Add audit-specific identifier schemas in `packages/protocol/src/audit.ts`.
  Rationale: fixed audit identifiers are not extensible details; reject unsafe values rather than preserving or redacting them in place.
  Alternative considered: apply redaction to fixed identifiers. That would alter record identity semantics and introduce new sentinel values in fields intended to remain identifiers.

- Reuse `hasSecretBearingProtocolIdentifierMetadata`.
  Rationale: this change covers authentication/session-secret marker families already recognized for protocol-facing identifiers. It avoids broadening unrelated global protocol identifier behavior.

- Keep content-shaped marker rejection out of this increment.
  Rationale: the current fixed identifier gap is about token/credential/cookie/key/auth marker families. Remote content marker expansion can be handled separately if needed, with its own compatibility analysis.

## Risks / Trade-offs

- [Risk] Direct callers that previously used secret-shaped fixed audit ids will fail validation. -> Mitigation: failing closed prevents audit evidence from storing secrets; callers can use neutral ids and put non-sensitive metadata in detail.
- [Risk] Relay code could be affected if it passed raw secret-bearing ids to the shared audit schema. -> Mitigation: relay already redacts/bounds secret-bearing relay session and peer ids before record creation; tests cover relay behavior separately.
