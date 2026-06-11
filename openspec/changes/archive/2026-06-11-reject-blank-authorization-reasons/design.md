## Context

Authorization reasons appear in state-machine records and protocol messages for denials, revocations, pause/resume, termination, expiration, and request context. These values are audit metadata. A whitespace-only value passes the current string length checks but is not meaningful to a host, viewer, or audit reviewer.

## Goals / Non-Goals

**Goals:**

- Reject whitespace-only reason values in authorization records and protocol messages.
- Keep optional reasons optional where they are already optional.
- Keep required denial, permission revocation, and termination reasons required and non-blank.
- Preserve existing agent-shell defaults and tests that send meaningful reasons.

**Non-Goals:**

- No new remote action capability.
- No changes to capture, input, clipboard, file transfer, installer, service, startup, privilege, or native Windows behavior.
- No redaction or localization changes; this is validation only.

## Decisions

- Use shared local non-blank reason schemas in `authorization.ts` and `messages.ts`. This keeps validation centralized within each module while avoiding a broader public API change.
- Validate at schema parse time so inbound external records and outbound encoded protocol messages follow the same invariant.
- Leave generic audit record `reason` validation unchanged in this change. This scope is authorization-specific and avoids expanding into every audit producer at once.

## Risks / Trade-offs

- Existing callers that pass whitespace-only reasons will now fail. Mitigation: such values are not useful audit records and should be rejected early.
- Reason text is still free-form and may need future redaction or reason-code normalization. Mitigation: this change only enforces non-blank intent; existing audit redaction and secret-safe detail rules remain in place.
