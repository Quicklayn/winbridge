## Context

The relay validates registered-peer messages before forwarding them between the host and viewer. Current code already binds legacy `host-consent-decision` to the registered host role and checks the declared host peer id, but the relay specs and integration coverage do not explicitly name this legacy grant-bearing message in the host-authority scenarios.

This change hardens the relay contract around an existing legacy consent message. It is security-sensitive because it touches relay routing, consent authority, and rejection audit/log handling.

## Goals / Non-Goals

**Goals:**

- Make legacy `host-consent-decision` an explicit relay host-authority boundary.
- Prove a registered viewer cannot forward a forged legacy consent decision before the host receives it.
- Keep rejection diagnostics bounded and secret-safe.
- Preserve `host-consent-required` as a viewer-originated request message.

**Non-Goals:**

- No native Windows capture, input, clipboard, file transfer, service, installer, startup, persistence, credential, or privilege-elevation work.
- No new production authentication model.
- No protocol shape changes.

## Decisions

- Reuse the existing registered-peer authority gate.
  - Rationale: `assertRegisteredPeerCanForward()` is already the single relay pre-forward role/peer authority boundary. Keeping the legacy decision under that path avoids a second policy surface.
  - Alternative considered: add a separate legacy-only relay check. Rejected because it would duplicate policy and increase the chance that future authority messages drift.

- Add explicit regression coverage even if the current implementation already rejects the message.
  - Rationale: the safety contract should survive later refactors, and `host-consent-decision` is grant-bearing legacy authority data.
  - Alternative considered: docs-only clarification. Rejected because this boundary is executable and should be verified.

- Keep rejection reasons metadata-only.
  - Rationale: forged messages may include private reasons or grant contents; relay errors and audit records must not echo raw protocol payloads.
  - Alternative considered: include message type in audit details for this specific rejection. Rejected for now because the existing bounded rejection contract is sufficient and avoids widening audit detail content.

## Risks / Trade-offs

- Existing code may already satisfy the behavior -> Mitigation: keep implementation scoped to tests/docs/specs unless a failing focused test proves code changes are needed.
- Over-classifying legacy requests as host authority could break legitimate request flow -> Mitigation: explicitly preserve `host-consent-required` as viewer-originated request semantics in specs and tests.
- Security regression in diagnostics could leak private reasons -> Mitigation: test with a private marker and assert it is absent from relay error/audit output.
