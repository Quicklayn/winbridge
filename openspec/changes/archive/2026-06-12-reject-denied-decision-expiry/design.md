## Context

`SessionAuthorizationDecisionMessageSchema` uses a single message shape for host
approval and denial. Approvals require `expiresAt`; denials require a reason and
empty grants. Today the schema does not reject `expiresAt` on denial, leaving an
approval-only field on a fail-closed decision.

## Goals / Non-Goals

**Goals:**

- Make denied authorization decisions unambiguously fail-closed by rejecting
  approval-only expiration metadata.
- Preserve approved decision validation and existing denied decision reason
  validation.
- Cover the invariant with focused protocol tests.

**Non-Goals:**

- Do not change authorization state records or state update messages.
- Do not change wire message type names or add new messages.
- Do not implement native capture, input, clipboard, file transfer, installer,
  service, startup, persistence, or privilege behavior.

## Decisions

- Add a `superRefine` rule in the existing decision schema rather than splitting
  the union into approved/denied variants. The current schema already centralizes
  decision invariants there, and this keeps error behavior consistent.
- Reject rather than ignore denied `expiresAt`. Silent ignoring could hide
  malformed sender behavior and make tests less precise.

## Risks / Trade-offs

- Existing tests or tools that send `expiresAt` with denied decisions will fail
  validation -> mitigation: denied decisions do not need expiration because they
  are terminal fail-closed outcomes; callers should remove the field.
- This does not validate semantic ordering of approval expiration timestamps ->
  mitigation: state-machine TTL/expiration behavior remains covered separately.
