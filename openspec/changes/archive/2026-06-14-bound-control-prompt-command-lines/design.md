## Context

Host and viewer control prompts are opt-in development surfaces backed by Node `readline`. The current parsers accept exact short commands and reject malformed input with generic messages, but there is no explicit maximum for the line passed into command parsing.

## Goals / Non-Goals

**Goals:**

- Bound interactive host and viewer control prompt command lines before parsing or dispatch.
- Use the same limit for host and viewer prompt code so future command additions stay consistent.
- Reject oversized input with existing generic rejection output and without raw input echo.
- Ensure oversized input does not call status reads, lifecycle controls, local disconnect, public sends, or protocol construction.

**Non-Goals:**

- No new protocol messages, relay behavior, reconnect behavior, authorization lifecycle changes, audit persistence changes, or Windows-native behavior.
- No capture, input, clipboard, file-transfer, diagnostics, unattended access, installer, startup, service, token, credential, privilege, or Windows prompt capability.
- No attempt to replace Node `readline` buffering before a newline is received; the bound applies when the prompt receives a complete command line.

## Decisions

- Add a shared exported constant for the maximum control prompt command line length.
  - Rationale: host and viewer prompts should enforce the same local boundary and tests can construct exact over-limit input without duplicating a magic number.
  - Alternative considered: separate constants per prompt. That would invite drift without a current role-specific need.
- Use UTF-8 byte length rather than JavaScript string length.
  - Rationale: byte length better reflects actual input size and avoids undercounting non-ASCII oversized input.
  - Alternative considered: code-unit length. It is simpler but less aligned with existing byte-length diagnostics elsewhere in the agent shell.
- Reuse the existing generic rejection message.
  - Rationale: it preserves the current secret-safe behavior and avoids exposing raw command text or byte contents.
  - Alternative considered: add a special "too long" diagnostic. That adds little value and expands observable input metadata.

## Risks / Trade-offs

- `readline` still buffers until newline before the prompt can reject a line. Mitigation: document and test the bound at command dispatch time; deeper stream-level throttling would be a separate change.
- Future longer commands could exceed the limit. Mitigation: choose a limit comfortably above current exact commands and keep the constant shared and visible to tests.
