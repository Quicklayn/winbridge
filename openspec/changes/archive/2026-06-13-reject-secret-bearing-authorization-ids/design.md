## Context

WinBridge currently treats `authorizationId` as a non-secret lifecycle identifier. It is stored in authorization records, carried in authorization protocol envelopes, used in `signal.payload.authorizationId`, and preserved in relay forwarding audit metadata for operational correlation.

The existing validation uses `ProtocolIdentifierSchema.min(8)`, which proves shape and length but does not reject strings that include token, credential, cookie, API-key, access-key, private-key, SSH-key, authorization-header, or auth-header markers. Since these ids are intentionally retained in logs/status surfaces, secret-bearing values must fail validation before becoming trusted lifecycle metadata.

## Goals / Non-Goals

**Goals:**

- Provide one reusable protocol-level `AuthorizationIdSchema` for non-secret authorization identifiers.
- Use that schema for authorization records, authorization lifecycle envelopes, permission-revoked messages, session-control messages, and `signal.payload.authorizationId`.
- Redact secret-bearing `authorizationId` values that arrive inside extensible audit detail metadata while preserving non-secret authorization ids.
- Preserve existing safe identifiers such as generated `authz_<uuid>` values and test/public `authz_*` identifiers.
- Verify relay rejection remains bounded and secret-safe before forwarding or accepted-forward audit persistence.

**Non-Goals:**

- No authorization workflow redesign and no change to host consent, visible-session activation, permission scope, revocation, pause/resume, or timeout semantics.
- No hidden-session, persistence, credential collection, keylogging, AV/EDR, Windows prompt, capture, input, clipboard, file-transfer, installer, startup, service, or privilege-elevation changes.
- No production identity shortcut. This only tightens protocol validation for values that are already treated as metadata.

## Decisions

1. Reject rather than redact `authorizationId`.

   Rationale: an authorization id is part of protocol identity and correlation, not a free-form audit field. Redacting it after acceptance would leave peers and state machines disagreeing about which authorization is bound to a message. Failing closed keeps unsafe identifiers out of state and forwarding paths.

   Alternative considered: redact only when writing relay audit records. That would reduce audit exposure but still allow secret-bearing ids into status and workflow surfaces, so it does not close the boundary.

2. Centralize validation in `packages/protocol`.

   Rationale: relay, agent-shell, and tests already depend on shared protocol schemas. A reusable schema avoids inconsistent local checks and keeps future protocol messages from accidentally using the generic identifier schema for auth ids.

   Alternative considered: add relay-only rejection. That would not protect local parsing, agent-shell argument handling, or direct protocol consumers.

3. Reuse the existing secret-marker categories through a protocol-identifier detector.

   Rationale: audit-event action validation and relay audit redaction already define the relevant marker families: token, credential, cookie, key, and authorization-header style data. A protocol-identifier-specific detector uses those same families while accounting for identifier separators.

   Alternative considered: reuse the audit reason detector directly. That detector is tuned for human-readable reasons and misses separator-only identifiers such as `token-raw-secret`.

4. Treat protocol identifier separators as secret-marker boundaries.

   Rationale: protocol identifiers allow `.`, `_`, `-`, and `:`, so values such as `token-raw-secret`, `cookie.raw.secret`, or `ssh-key-raw-secret` must be caught even when they are not key/value assignments.

   Alternative considered: rely only on the audit reason detector. That detector is tuned for human-readable reasons and misses separator-only protocol identifiers.

## Risks / Trade-offs

- [Risk] A test or development script may have used a secret-like authorization id for convenience. → Mitigation: generated ids and safe `authz_*` identifiers remain accepted; failures will be explicit schema errors.
- [Risk] Validation messages could reveal raw ids if bubbled up incorrectly. → Mitigation: relay continues returning bounded `Invalid relay message` diagnostics and tests assert raw secret markers are absent from peer-facing errors and audit records.
- [Risk] Importing the detector could create module cycles. → Mitigation: define the reusable schema in `authorization.ts`, which can import from `audit.ts` without `messages.ts` being imported back into either module.
- [Risk] `audit-event.detail.authorizationId` is extensible metadata rather than a fixed protocol field. → Mitigation: redact only secret-bearing authorization-id values, leaving non-secret lifecycle identifiers inspectable.
