## Context

The agent shell has an opt-in interactive host control prompt for development workflows. The prompt already accepts exact `status`, `pause`, `resume`, `revoke <permission>`, `terminate`, and `disconnect` commands, rejects malformed input without echoing it, and routes lifecycle commands through managed runtime controls that enforce visible authorization gates.

The new `help` command is a host-operator ergonomics improvement. It must remain a local prompt feature, not a new remote assistance capability.

## Goals / Non-Goals

**Goals:**

- Add a discoverable, exact `help` command for the host control prompt.
- Keep help output static, bounded, and secret-safe.
- Preserve exact command parsing and non-echoing rejection behavior.
- Prove with focused tests that `help` does not call runtime status, lifecycle controls, viewer leave, or public sends.

**Non-Goals:**

- No protocol, relay, auth, token, audit persistence, installer, startup, service, native Windows API, capture, input, clipboard, file-transfer, diagnostics, or privilege changes.
- No fuzzy aliases, case-insensitive parsing, partial command matching, or command auto-completion.
- No viewer control prompt changes in this increment.

## Decisions

- Extend the existing host command union with `help`.
  - Rationale: the parser is already the boundary for exact command acceptance, so adding `help` there keeps validation centralized.
  - Alternative considered: treat help as a separate pre-parse special case. Rejected because it would split exact command behavior across paths.

- Handle `help` before status and lifecycle command execution.
  - Rationale: help is static and must not read runtime state or invoke controls.
  - Alternative considered: implement help by reflecting available commands from runtime capabilities. Rejected because it would add unnecessary runtime coupling and potential data exposure.

- Reuse the existing malformed-command rejection path.
  - Rationale: it already avoids raw command echo and keeps unsafe input out of output.
  - Alternative considered: print command-specific help for malformed input. Rejected because malformed input could include secrets or hostile text.

## Risks / Trade-offs

- [Risk] Help output could drift from accepted commands. -> Mitigation: keep help text beside parser constants and add tests for accepted help output.
- [Risk] Future contributors might accidentally make help stateful. -> Mitigation: tests assert no runtime status, lifecycle, leave, or public send calls.
- [Risk] More commands in the prompt slightly enlarge the user-visible CLI surface. -> Mitigation: only an exact static read-only command is added; all malformed variants remain rejected.
