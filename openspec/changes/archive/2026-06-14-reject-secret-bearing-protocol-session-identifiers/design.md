## Context

WinBridge protocol envelopes share `protocolVersion`, `messageId`, `sessionId`, and `createdAt` through `BaseMessageSchema`. `messageId` already rejects secret-bearing marker metadata at this shared layer, while `sessionId` still uses the generic `SessionIdSchema` for most message types. Some downstream paths already reject or redact secret-bearing session identifiers, but the behavior is inconsistent and leaves relay forwarding and runtime event handling dependent on per-message checks.

The relay also has older requirements describing secret-bearing join `sessionId` values as audit-only redaction cases. The current safety direction is stricter: secret-bearing room/session identifiers should not create rooms, pairing tickets, accepted joins, denied join audits, or forwarded messages.

## Goals / Non-Goals

**Goals:**

- Reject secret-bearing base protocol `sessionId` values in one shared schema path.
- Keep rejection diagnostics bounded and free of raw rejected identifier text.
- Preserve safe development identifiers and existing non-secret protocol behavior.
- Align relay-runtime specs with fail-closed join session identifier handling.

**Non-Goals:**

- No new authentication, account identity, NAT traversal, capture, input, clipboard, file-transfer, diagnostics, installer, service, startup, persistence, privilege, or Windows prompt behavior.
- No change to the generic `SessionIdSchema` used by lower-level helpers where a capability-specific schema already exists.
- No change to audit-only redaction for safe-to-accept peer identifiers that are not used as secret-bearing session or pairing identifiers.

## Decisions

1. Add a protocol-specific `ProtocolSessionIdSchema` in `packages/protocol/src/messages.ts`.
   - Rationale: the protocol envelope is the highest-leverage boundary before parse, encode, relay forwarding, accepted-forward audit, and trusted runtime events.
   - Alternative considered: change `SessionIdSchema` globally. Rejected for this increment because lower-level capabilities already use targeted schemas and a global change would have a larger blast radius across authorization, pairing, audit, CLI, and tests.

2. Reuse `hasSecretBearingProtocolIdentifierMetadata`.
   - Rationale: marker-family behavior stays consistent with message ids, authorization ids, audit ids, grant ids, identity ids, and pairing ids.
   - Alternative considered: add a new session-id-only classifier. Rejected because it would create divergent secret detection.

3. Keep relay peer-id redaction separate from session-id rejection.
   - Rationale: relay peer ids can be accepted when they are not used as fallback pairing device identifiers and are safely redacted from audit. Base protocol `sessionId` is room metadata and should fail closed consistently.

## Risks / Trade-offs

- Existing callers that used token-like text as a protocol `sessionId` will now fail at parse/encode time. This is intentional fail-closed behavior and should be fixed by moving secrets to dedicated authenticated/token paths.
- Some older relay-runtime requirements need wording updates. The migration is spec-only and does not require a wire-format version bump because the accepted safe protocol shape is unchanged.
