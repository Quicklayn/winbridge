## Context

The agent shell has an opt-in interactive viewer control prompt for development workflows. It currently accepts exact `status` and `disconnect` commands, rejects malformed input without echoing it, reads a bounded local viewer snapshot for `status`, and uses the managed viewer-only `leave()` control for `disconnect`.

The new `help` command is a local usability improvement for command discovery. It must not become a stateful runtime operation or a remote assistance capability.

## Goals / Non-Goals

**Goals:**

- Add a discoverable, exact `help` command for the viewer control prompt.
- Keep help output static, bounded, and secret-safe.
- Preserve exact command parsing and non-echoing rejection behavior.
- Prove with focused tests that `help` does not call viewer status, viewer leave, host lifecycle controls, or public sends.

**Non-Goals:**

- No protocol, relay, auth, token, audit persistence, installer, startup, service, native Windows API, capture, input, clipboard, file-transfer, diagnostics, or privilege changes.
- No fuzzy aliases, case-insensitive parsing, partial command matching, or command auto-completion.
- No host control prompt changes in this increment.

## Decisions

- Extend the existing viewer command union with `help`.
  - Rationale: the parser is already the exact-command acceptance boundary.
  - Alternative considered: handle `help` before parsing. Rejected because it would split validation logic.

- Handle `help` before status and disconnect execution.
  - Rationale: help is static and must not read runtime state or invoke `leave()`.
  - Alternative considered: generate help from runtime capabilities. Rejected because viewer prompt capabilities are static and runtime reflection would add unnecessary coupling.

- Reuse the existing malformed-command rejection path.
  - Rationale: it already avoids raw command echo.
  - Alternative considered: print corrective help on malformed input. Rejected because malformed input can contain secrets or hostile text.

## Risks / Trade-offs

- [Risk] Help text could drift from accepted commands. -> Mitigation: keep help text near parser constants and add tests for exact output.
- [Risk] Future edits could make help stateful. -> Mitigation: tests assert no viewer status, leave, host control, or public send calls.
- [Risk] The prompt surface grows by one command. -> Mitigation: only exact `help` is accepted; malformed variants stay rejected.
