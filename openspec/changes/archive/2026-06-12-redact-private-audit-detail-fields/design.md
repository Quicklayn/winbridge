## Context

Shared audit records and protocol `audit-event` messages already use one redaction function for detail objects. That function is key-based and recursively protects credentials, tokens, pairing codes, remote content, and common authentication headers. Agent-shell workflow code avoids writing raw private reason text or display names today, but the shared audit layer does not centrally protect common detail keys if a future component accidentally includes them.

This change is a log/audit hardening increment. It does not add a production audit backend, identity system, relay authorization state machine, native Windows capability, or remote action.

## Goals / Non-Goals

**Goals:**

- Redact common raw display-name detail keys in shared audit detail processing.
- Redact common raw private reason detail keys in shared audit detail processing.
- Preserve safe metadata fields such as `reasonCode`, `reasonConfigured`, and non-secret lifecycle identifiers such as `authorizationId`.
- Apply the behavior consistently to in-memory, console, file, and protocol `audit-event` detail normalization.

**Non-Goals:**

- No value-based natural-language PII detection.
- No production durable/distributed audit storage.
- No changes to host consent, authorization transitions, relay routing, native capture, input, clipboard, file transfer, diagnostics, reconnect, installer, service, startup, privilege, evasion, or Windows prompt behavior.

## Decisions

- Use exact normalized key matching for display-name and private-reason keys.
  Rationale: exact keys protect the common accidental leak cases without over-redacting safe fields such as `reasonCode`, `reasonConfigured`, or future reason-category booleans.

- Keep `authorizationId` and existing metadata identifiers inspectable.
  Rationale: lifecycle identifiers are bounded machine metadata and are used for consent/audit correlation.

- Reuse the existing recursive redaction path.
  Rationale: all shared audit sinks and protocol `audit-event` parsing already normalize through this path, so a single implementation change keeps behavior consistent.

## Risks / Trade-offs

- Future components may invent new private metadata key names not covered by the exact list -> add tests and extend the exact allow/deny list as new workflow fields are introduced.
- Exact matching is less aggressive than substring matching -> chosen intentionally to avoid hiding bounded operational metadata such as `reasonCode`.
- Redacting display names in generic audit detail may remove useful support context -> acceptable for development audit safety; UI-facing display metadata remains available through protocol messages and local event views where explicitly allowed.
