## Context

`AuditEventMessageSchema` applies `redactAuditDetail` to `detail` during protocol parsing and `encodeProtocolEnvelope` parses before encoding. Expanded audit detail redaction therefore already protects protocol `audit-event` messages, but the protocol tests still exercise only the older sensitive-key list.

## Goals / Non-Goals

**Goals:**

- Verify expanded authentication/session secret keys are redacted at the protocol `audit-event` parse boundary.
- Verify expanded keys are redacted before protocol `audit-event` encoding.
- Verify non-secret lifecycle identifiers such as `authorizationId` remain inspectable.
- Keep one shared redaction implementation in `packages/protocol/src/audit.ts`.

**Non-Goals:**

- No new redaction implementation in `messages.ts`.
- No protocol schema shape changes.
- No relay, authorization, consent workflow, capture/input, installer, service, startup, or privilege changes.

## Decisions

1. Add protocol-level tests instead of duplicating redaction logic.

   `AuditEventMessageSchema` already imports the shared redactor. Tests should prove that schema integration keeps using it for both parse and encode flows.

   Alternative considered: add a second protocol-specific sensitive-key list. Rejected because duplicated lists drift and are harder to review safely.

2. Update the existing protocol audit-event requirement wording.

   The main audit detail redaction requirement already covers expanded keys. The protocol audit-event requirement should name the same key family so the wire-message boundary is explicit.

## Risks / Trade-offs

- This is primarily verification/spec alignment, not new behavior -> acceptable because protocol boundary coverage is security-relevant.
- Key-based redaction still cannot catch secrets under harmless-looking keys -> unchanged residual risk from the shared audit redaction design.
