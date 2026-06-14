## Context

The authorization package stores consent-bound state for visible, scoped, expiring remote assistance. `AuthorizationIdSchema` already rejects secret-bearing marker families through the shared protocol identifier classifier, while `sessionId`, `hostPeerId`, and `viewerPeerId` currently rely on base identifier syntax only.

Those fixed identifiers are not credentials, pairing codes, tokens, or authorization headers. Allowing such text in authorization records makes later audit, lifecycle, and action-authorization paths harder to keep secret-safe.

## Goals / Non-Goals

**Goals:**

- Reuse the shared protocol identifier classifier for `SessionAuthorizationSchema.sessionId`, `hostPeerId`, and `viewerPeerId`.
- Reject unsafe fixed identifiers before pending authorization creation, lifecycle transitions, expiration checks, or action authorization can trust the record.
- Keep rejection diagnostics bounded and free of raw rejected identifier text.
- Preserve existing accepted development identifiers and all consent, visibility, expiration, and permission-scope behavior.

**Non-Goals:**

- No new permission, capture, input, reconnect, clipboard, file-transfer, diagnostics, relay, native Windows, installer, startup, service, persistence, or privilege-elevation behavior.
- No changes to pairing-code generation, authentication, token formats, relay routing, or audit persistence.

## Decisions

- Add authorization-local refined identifier schemas for fixed record ids instead of changing global `SessionIdSchema` or `PeerIdSchema`.
  - Rationale: a global change would affect relay join compatibility and other protocol consumers. This change only hardens consent-bearing authorization records.
  - Alternative considered: rely on callers to sanitize before constructing authorization records. Rejected because schema-level validation gives one fail-closed boundary for constructors, transitions, parsing, and action checks.
- Use the existing `hasSecretBearingProtocolIdentifierMetadata` classifier.
  - Rationale: it keeps marker-family behavior consistent with audit, protocol envelopes, grants, identity, and pairing.
  - Alternative considered: introduce authorization-specific marker lists. Rejected because it would drift from existing protocol metadata safety rules.
- Add tests that assert bounded error text.
  - Rationale: the important behavior is both fail-closed rejection and not echoing raw token-like values.

## Risks / Trade-offs

- [Risk] Some development fixture may have used token-like labels as identifiers.
  - Mitigation: existing safe fixtures remain accepted; rejected values are intentionally credential-like and should not become trusted auth metadata.
- [Risk] Broader global identifier hardening may still be desirable later.
  - Mitigation: keep this change scoped to authorization records and document the classifier coverage in `protocol-identifiers`.
