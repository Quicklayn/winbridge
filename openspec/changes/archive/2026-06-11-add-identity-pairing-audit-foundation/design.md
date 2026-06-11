## Context

WinBridge is still in a TypeScript bootstrap phase. The relay is a development relay and not production authorization. The next safe step is to model identity, pairing, and audit contracts so later host UI, WebRTC, and native input/capture work can depend on stable security primitives.

## Goals / Non-Goals

**Goals:**

- Provide schema-validated local device identity metadata.
- Provide expiring pairing-ticket contracts that store a pairing-code hash instead of raw pairing codes.
- Provide structured audit records for session lifecycle and relay events.
- Add development audit sinks that are easy to test.
- Emit relay audit events without logging secrets.

**Non-Goals:**

- No production account system, MFA, SSO, or RBAC.
- No long-lived credential storage.
- No native Windows identity integration.
- No capture, input, clipboard, file transfer, installer, service, privilege, or startup behavior.

## Decisions

1. **Represent identity as local device metadata, not a user account.**
   - Rationale: The product needs identity fields in messages now, but production account semantics need a separate design.
   - Alternative considered: Add account auth immediately. That would be premature and would create security-sensitive decisions without UI and deployment context.

2. **Hash pairing codes before storing them in tickets or audit details.**
   - Rationale: Development logs and tickets should not preserve raw join credentials.
   - Alternative considered: Store raw pairing code for debugging. That increases credential leakage risk.

3. **Add `packages/audit-log` as a reusable package.**
   - Rationale: Relay, shell, and future clients need the same audit sink contract.
   - Alternative considered: Keep relay-only logging. That would duplicate audit semantics later.

4. **Relay emits audit records but remains a development relay.**
   - Rationale: Audit visibility is useful now, while production identity and persistence remain future work.
   - Alternative considered: Block all relay work until production auth exists. That would slow protocol testing without improving current safety.

## Risks / Trade-offs

- **Risk: Local device identity may be mistaken for strong authentication.** -> Mitigation: docs and schemas call it local identity; production auth remains a future OpenSpec change.
- **Risk: Audit details leak sensitive values.** -> Mitigation: avoid raw token and raw pairing-code logging; tests cover hashed pairing tickets.
- **Risk: Relay audit output is not durable.** -> Mitigation: call it a development sink and keep audit persistence as future work.

## Migration Plan

1. Add protocol identity, pairing, and audit schemas.
2. Add audit-log package and tests.
3. Update relay join handling and audit events.
4. Update agent shell join metadata.
5. Validate OpenSpec and run npm checks/tests/build.

## Open Questions

- Which production identity provider should be used for beta accounts?
- Should audit persistence be local encrypted storage, server-side immutable logs, or both?
- Should pairing tickets become signed JWT/PASETO-style objects or remain server-side opaque records?
