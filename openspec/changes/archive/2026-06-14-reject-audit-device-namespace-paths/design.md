## Context

WinBridge now rejects malformed audit paths, Windows reserved device path segments, and Windows alternate data stream syntax before constructing development file audit sinks. Windows also exposes device namespace prefixes such as `\\.\` and `\\?\`, which can bypass ordinary path normalization or target non-file namespaces.

Audit JSONL files are a safety and accountability surface for consent-first development workflows. A path configured through a device namespace is not an ordinary reviewable audit file path, even if some values would fail later during append.

## Goals / Non-Goals

**Goals:**

- Reject Windows device namespace audit paths before file sink construction, relay startup, or agent-shell runtime startup.
- Preserve ordinary relative paths and standard drive-prefix paths.
- Keep validation centralized in `packages/audit-log`.
- Keep diagnostics generic and free of raw configured path values.

**Non-Goals:**

- No remote capture, input, clipboard, file-transfer, diagnostics, installer, service, startup persistence, or privilege behavior changes.
- No platform-specific filesystem probing.
- No change to omitted audit path fallback behavior.

## Decisions

- Reject lexical prefixes matching two leading slashes or backslashes followed by `.` or `?`, then a slash, backslash, or end of string.
  - Rationale: this catches `\\.\`, `\\?\`, `//./`, and `//?/` consistently across platforms before write attempts.
  - Alternative considered: reject all UNC-like paths. That would also reject ordinary network share paths, which is broader than needed for this hardening step.

- Keep the check in the shared `assertAuditLogPath` validator.
  - Rationale: relay env parsing, agent CLI/env parsing, and direct file sink construction already use that path.

- Extend existing sanitized error-message wording rather than include the rejected value.
  - Rationale: audit path values can carry secrets or misleading text; callers already assert generic diagnostics.

## Risks / Trade-offs

- Some extended-length Windows file paths become invalid -> mitigation: ordinary relative and drive-root audit paths remain supported and documented.
- The check is lexical rather than filesystem-aware -> mitigation: deterministic lexical rejection catches the risky namespace prefix before any filesystem side effect.

## Migration Plan

Update the shared validator, targeted tests, docs, and specs. Users with device namespace audit paths must choose a normal local JSONL file path.

## Open Questions

None.
