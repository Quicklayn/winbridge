## Context

WinBridge already rejects unsafe control and format characters for display names, relay tokens, and audit log paths. Authorization lifecycle reasons and agent-shell workflow reasons are currently only bounded, non-blank, and trimmed. These reason strings are private metadata that may be persisted, summarized, or redacted through audit/runtime paths, so accepting invisible or directional controls leaves room for misleading records even when raw reason text is later redacted.

## Goals / Non-Goals

**Goals:**

- Reject ASCII control characters in authorization and agent-shell workflow reasons.
- Reject Unicode bidirectional and zero-width formatting controls, including `U+FEFF`.
- Fail closed before authorization transitions, parsed authorization records, relay startup, socket writes, trusted runtime events, workflow messages, or audit events.
- Keep errors generic and avoid echoing raw private reason text.

**Non-Goals:**

- No automatic trimming, Unicode normalization, or repair of malformed reason values.
- No changes to host consent semantics, permission scopes, relay routing, capture, input, clipboard, file transfer, installer, startup, services, privilege elevation, or persistence.
- No new user-visible remote assistance capability.

## Decisions

- Extend existing local validators rather than introducing a shared validation module.
  - Rationale: the existing codebase keeps small character guards near each boundary. A shared helper could be useful later, but would be broader than this focused hardening change.

- Use the same denylist shape already used for token/display-name controls.
  - Rationale: consistency avoids surprising differences between visible names, tokens, paths, and reason metadata while keeping the implementation easy to audit.

- Preserve generic error messages.
  - Rationale: reason text may contain private workflow context. Validation failures should identify the invalid class without including raw values.

## Risks / Trade-offs

- [Risk] Duplicate local helpers can drift across protocol and agent-shell modules. -> Mitigation: add focused regression tests in all affected boundaries and consider a later shared helper refactor.
- [Risk] Operators may paste text containing hidden formatting marks. -> Mitigation: fail closed and require explicit correction because these values become authorization/audit metadata.
- [Risk] This touches authorization and log-adjacent behavior. -> Mitigation: run focused tests, full gates, strict OpenSpec validation, and security review before archiving.
