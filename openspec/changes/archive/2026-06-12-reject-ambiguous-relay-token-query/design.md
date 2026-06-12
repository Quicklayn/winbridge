## Context

Shared relay tokens are a development-only access guard. They are not production identity or authorization, but they still gate entry to the development relay before pairing and room registration. Credential-bearing inputs should be unambiguous so future clients and audit records cannot disagree about which credential was presented.

`URLSearchParams.get("token")` returns the first value when a URL contains duplicate `token` parameters. That behavior can make `?token=valid&token=other` look valid to the relay even though the request carried multiple credential values.

## Goals / Non-Goals

**Goals:**

- Reject token-protected relay connections when `token` appears zero times, more than once, or with a value that does not exactly match the configured shared token.
- Preserve successful connections with exactly one matching token.
- Preserve secret-safe denial audits and bounded close reasons.

**Non-Goals:**

- No production authentication or authorization design.
- No token storage, rotation, identity provider, account, MFA, RBAC, or reconnect design.
- No changes to pairing ticket lifecycle or room registration semantics after a token is accepted.
- No changes to consent, authorization state machine, capture, input, clipboard, file transfer, diagnostics, installer, startup, service, or privilege behavior.

## Decisions

1. Require exactly one `token` query parameter when a shared token is configured.
   - Rationale: missing, duplicated, or wrong credentials are all invalid credential presentation and should be rejected before registration.
   - Alternative considered: accept the first `token` value. Rejected because duplicate credential material is ambiguous and can hide operator/client mistakes.

2. Keep the existing peer-facing close reasons.
   - Rationale: `Invalid relay token` and rate-limit closure are bounded, already tested, and do not reveal whether the failure was missing, duplicate, or mismatched token.

3. Keep audit detail boolean-only for token presentation.
   - Rationale: audit should prove a token-bearing access attempt happened without storing raw tokens or token counts that could become a side channel.

## Risks / Trade-offs

- Clients that accidentally append a second token will now be rejected. This is intended fail-closed behavior; supported clients should pass one token via the dedicated agent-shell token option.

## Migration Plan

Use one `token` query parameter for direct development relay connections, or the agent shell `--token` / runtime `token` option for managed clients.

## Open Questions

None.
