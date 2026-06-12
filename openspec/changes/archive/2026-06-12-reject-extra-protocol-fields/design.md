## Context

WinBridge parses peer-supplied protocol envelopes, relay-generated protocol messages, agent-shell inbound/outbound messages, audit records, pairing records, session grants, device identities, and authorization records through shared Zod schemas in `packages/protocol`. Zod object schemas strip unknown keys by default unless strict parsing is requested, so a malformed object can be accepted after an unknown fixed-shape field is removed.

That default is not a good security boundary for remote-assistance protocol data. The product relies on explicit consent, host visibility, permission scoping, and auditability; fixed protocol records should not accept ambiguous fields that could be interpreted by a later component, log pipeline, or UI layer.

## Goals / Non-Goals

**Goals:**

- Reject unknown fields on fixed-shape protocol envelopes and protocol-owned nested records.
- Reject unknown fields on fixed-shape audit, identity, pairing, session grant, and session authorization records.
- Preserve `signal.payload`, protocol `audit-event.detail`, and audit record `detail` as intentional JSON-compatible metadata containers.
- Keep relay malformed-message errors and audit reasons bounded and secret-safe.
- Add focused tests that exercise unit-level schema behavior, relay-level rejection before forwarding, and agent-shell receive/send rejection before trusted runtime events or socket writes.

**Non-Goals:**

- No changes to protocol identifier syntax, permission names, authorization lifecycle rules, pairing code hashing, or relay shared-token validation.
- No narrowing of JSON metadata containers beyond existing JSON compatibility, size, sensitive-key rejection, and redaction rules.
- No new capture, input, clipboard, file transfer, diagnostics, installer, startup, service, persistence, privilege, native Windows, or remote-control capability.
- No compatibility adapter that silently strips unknown fixed fields.

## Decisions

- Use strict Zod object parsing for fixed-shape records.
  - Rationale: strict parsing makes the schema boundary explicit and fail-closed.
  - Alternative considered: keep strip behavior and add post-parse comparisons. That would be more complex and easier to bypass when new schemas are added.

- Keep JSON metadata containers open through existing `createJsonObjectSchema` validation.
  - Rationale: `signal.payload` and audit details are intentionally extensible, but already constrained to JSON-compatible values and protected by sensitive-key rejection or redaction.
  - Alternative considered: strict allowlists inside payload/detail. That would prematurely freeze signaling metadata and audit diagnostics.

- Put the rule in `packages/protocol` rather than relay-only or agent-shell-only guards.
  - Rationale: relay, agent shell, tests, and future clients share the same contract; fixing only one caller would leave other parsers with different behavior.
  - Alternative considered: add runtime filtering in `apps/relay`. That would not protect local encode/decode and audit sinks.

- Add relay and agent-shell integration coverage for inbound or public-send extra fixed fields.
  - Rationale: unit tests prove schemas reject unknown fields, while integration coverage proves relay and agent-shell boundaries handle malformed input safely.

## Risks / Trade-offs

- Malformed clients that relied on unknown fixed fields being ignored will now fail. Mitigation: this is limited to invalid fixed-shape input; valid envelopes and intentional metadata containers remain supported.
- Strict object parsing may surface new test failures where internal helpers pass extra properties. Mitigation: update only the affected tests or helper calls when the extra property was not part of the public contract.
- Zod union errors for strict protocol envelopes may be less specific. Mitigation: relay already maps parser failures to bounded secret-safe malformed-protocol errors; tests assert rejection and non-forwarding rather than raw parser text.
- Future schemas may forget strict mode. Mitigation: add tests that exercise representative fixed-shape boundaries and document the requirement in OpenSpec.
