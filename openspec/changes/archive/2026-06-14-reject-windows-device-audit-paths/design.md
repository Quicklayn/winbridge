## Context

The shared `FileAuditSink` validates audit log paths before appending JSONL records. Existing validation rejects blank, untrimmed, oversized, ASCII-control, and Unicode format-control paths. On Windows, path segments whose device name is `CON`, `CONIN$`, `CONOUT$`, `PRN`, `AUX`, `NUL`, `COM1`-`COM9`, or `LPT1`-`LPT9` can target special devices even when an extension is present, which weakens audit persistence evidence.

Relay and agent-shell audit configuration already use the shared audit log path validator, so a single shared validation change can fail closed across both development components.

## Goals / Non-Goals

**Goals:**

- Reject audit log paths containing Windows reserved device path segments before any record is written.
- Keep rejection errors bounded and free of the raw configured path.
- Preserve accepted safe lookalike paths such as `logs/null-audit.jsonl`.
- Reuse the existing shared validator so relay and agent-shell configuration inherit the behavior.

**Non-Goals:**

- Do not add production audit storage, accounts, remote telemetry, or durable server-side logging.
- Do not change audit record schemas, redaction rules, relay routing, authorization behavior, or workflow audit emission.
- Do not implement native Windows capture/input, installer behavior, startup persistence, services, or privilege behavior.

## Decisions

- Detect reserved device names by path segment, not by full path string.
  - Rationale: `logs/NUL.jsonl` and `C:\logs\CON` are unsafe even though the full path is not exactly the device name.
  - Alternative considered: reject only exact full-path device names. That misses nested device targets.

- Treat extensions as still unsafe for reserved device base names.
  - Rationale: Windows reserved device names remain special with extensions such as `NUL.txt`.
  - Alternative considered: only reject extensionless segments. That would leave common misleading JSONL paths accepted.

- Keep the check in `assertAuditLogPath`.
  - Rationale: all development file audit entry points already use the shared validator.
  - Alternative considered: add relay and agent-shell-specific checks. That risks drift and duplicated error handling.

## Risks / Trade-offs

- Some development paths that happen to use a reserved segment as a filename will now fail. -> This is intended because those paths are not reliable audit files on Windows.
- The validation is conservative on non-Windows environments too. -> WinBridge is Windows-to-Windows focused, and rejecting ambiguous device-like audit paths improves cross-environment safety.
