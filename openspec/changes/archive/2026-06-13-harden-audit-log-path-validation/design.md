## Overview

This change centralizes development audit log path validation in the shared audit-log package and reuses it from relay and agent-shell entry validation. The accepted path contract remains intentionally simple and local-development oriented: a path is valid only when it is a string that is non-blank, already trimmed, at most 1024 UTF-8 bytes, and contains no ASCII control characters.

## Security Rationale

Audit paths are operator-provided configuration, and they control where local evidence is persisted. Control characters and very large strings are not useful for the current development workflow and can make diagnostics, shell history, file APIs, and future UI display harder to reason about. Rejecting them early keeps failure behavior explicit and avoids fallback to console audit behavior when a file path was requested.

The validation error remains generic so private local path fragments are not echoed in logs, stderr, or test diagnostics.

## Implementation

- Export `MAX_AUDIT_LOG_PATH_BYTES` and `assertAuditLogPath` from `@winbridge/audit-log`.
- Use `assertAuditLogPath` in `FileAuditSink`.
- Use the same validator in relay audit sink creation with the existing relay-specific error message.
- Use the same validator in agent-shell CLI/env parsing and translate failures into bounded usage errors.
- Add focused tests for control-character, oversized, untrimmed, and secret-safe rejection paths.

## Alternatives Considered

- Restrict to relative paths only: rejected for this increment because existing documentation and tests allow general local file paths, including temporary absolute paths.
- Restrict Windows device names or UNC paths: deferred until a broader Windows installer/runtime file-location policy exists.

## Safety Impact

This change does not add remote access capability. It strengthens audit/log startup validation and preserves consent-first invariants: no hidden session, no stealth persistence, no credential theft, no keylogging, no AV/EDR evasion, and no Windows prompt bypass.
