## Context

Protocol reason fields appear on consent and authorization lifecycle messages such as `session-authorization-request`, denial decisions, authorization state updates, `permission-revoked`, `session-control`, and legacy host consent denials. The agent shell redacts these reasons in local events, and relay invalid-message handling uses bounded generic rejection reasons, but accepting invisible or directional controls at schema parse time leaves room for ambiguous lifecycle metadata to pass across components.

## Goals / Non-Goals

**Goals:**

- Add protocol-level rejection of ASCII control characters in `reason` fields.
- Add protocol-level rejection of Unicode bidi and zero-width formatting controls, including `U+FEFF`.
- Preserve fail-closed behavior before forwarding, socket write, trusted runtime event emission, or workflow processing.
- Keep diagnostics secret-safe by not including raw reason values in validation messages, relay close reasons, local events, or audit records.

**Non-Goals:**

- No trimming, Unicode normalization, or automatic repair of malformed reason text.
- No changes to permission semantics, relay routing rules, host approval requirements, visible-session requirements, capture, input, clipboard, file transfer, installer, startup, services, privilege elevation, or persistence.
- No new production authentication mechanism.

## Decisions

- Extend `ProtocolReasonSchema` directly.
  - Rationale: every affected protocol message already uses the shared schema, so one boundary change covers generated, public-send, inbound, and relay-forwarded protocol envelopes.

- Use the same explicit unsafe-character helper shape already used for display names, tokens, audit paths, and workflow reasons.
  - Rationale: the project already defines the intended bidi/zero-width denylist as an explicit set. Reusing it keeps behavior predictable and testable.

- Add relay integration coverage in addition to shared protocol tests.
  - Rationale: the protocol parser is the primary guard, while relay coverage proves malformed reasons are rejected before forwarding and without raw reason leakage.

## Risks / Trade-offs

- [Risk] The denylist is intentionally explicit rather than the entire Unicode format category. -> Mitigation: align with existing specs and helpers, including `U+FEFF`, and keep future expansion as a separate change if needed.
- [Risk] Some pasted user-provided reason text may contain hidden controls. -> Mitigation: fail closed and require explicit correction because reason metadata is authorization/audit-adjacent.
- [Risk] This touches auth/log-adjacent protocol behavior. -> Mitigation: focused tests, full verification gate, strict OpenSpec validation, and security review before archive.
