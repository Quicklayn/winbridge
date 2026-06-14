## Context

WinBridge currently validates configured development audit log paths for blank, untrimmed, oversized, control-character, Unicode formatting-control, and Windows reserved device path values before constructing relay or agent file audit sinks. That protects audit persistence from obvious malformed values, but Windows also permits alternate data stream syntax through `:` in a filename segment, such as `logs\audit.jsonl:hidden`.

Audit JSONL output is an accountability artifact for remote assistance development workflows. A configured path that writes to a hidden stream would make the audit record less visible to ordinary file inspection even though the relay or agent believes file persistence is enabled.

## Goals / Non-Goals

**Goals:**

- Reject Windows alternate data stream audit paths before file sink construction, relay startup, or agent-shell runtime startup.
- Preserve ordinary drive-root paths like `C:\logs\audit.jsonl` and `D:/logs/audit.jsonl`.
- Keep validation centralized in `packages/audit-log` so relay and agent behavior remains consistent.
- Keep diagnostics sanitized and free of raw configured path values.

**Non-Goals:**

- No remote capture, input, clipboard, file-transfer, diagnostics, installer, service, startup persistence, or privilege behavior changes.
- No platform-specific filesystem probing or Windows-only runtime dependency.
- No change to omitted audit path fallback behavior.

## Decisions

- Treat any colon in a non-initial path segment as a Windows stream indicator and reject it.
  - Rationale: `file:stream` is the risky shape for alternate data streams, and a segment-based check handles both slash styles.
  - Alternative considered: reject every `:` everywhere. That would incorrectly reject ordinary absolute Windows drive paths.

- Allow only an exact first segment matching a drive prefix such as `C:` when the path is split on `/` or `\`.
  - Rationale: `C:\logs\audit.jsonl` and `D:/logs/audit.jsonl` remain usable. Ambiguous drive-relative values like `C:audit.jsonl` are rejected because the first segment is not only a drive prefix and can hide stream-like semantics from casual review.
  - Alternative considered: accept any leading `<letter>:` prefix. That would preserve more Windows path forms, but it makes stream detection harder to explain and less conservative for audit evidence.

- Keep the existing sanitized error-message approach and extend the generic wording to mention alternate data stream path segments.
  - Rationale: callers already assert on bounded diagnostics, and raw configured paths can contain secrets or confusing control text.

## Risks / Trade-offs

- Some uncommon Windows drive-relative audit paths may become invalid -> mitigation: absolute drive paths and relative paths without `:` remain valid and are documented.
- The check is lexical rather than filesystem-aware -> mitigation: lexical rejection is deterministic across platforms and catches the risky ADS syntax before any write attempt.
- Error messages become longer -> mitigation: tests assert only bounded text and no raw configured value for sensitive failure cases.

## Migration Plan

Update the shared validator, relay/agent tests, and documentation. Existing safe relative paths and ordinary drive-root paths continue to work. Users with stream-style or drive-relative audit paths must choose a normal JSONL file path.

## Open Questions

None.
