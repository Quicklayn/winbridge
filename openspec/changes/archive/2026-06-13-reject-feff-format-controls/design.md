## Context

WinBridge currently validates protocol display names and development tokens with explicit character checks. The code rejects bidi controls and common zero-width controls, but the helper implementations omit `U+FEFF` even though requirements already describe zero-width-control rejection in several token paths.

## Goals / Non-Goals

**Goals:**

- Reject `U+FEFF` consistently wherever current code rejects Unicode bidi or zero-width formatting controls for display names and development tokens.
- Preserve existing fail-closed behavior before relay startup, peer registration, message forwarding, or trusted runtime event emission.
- Keep diagnostics secret-safe by retaining generic errors that do not include raw display names or token values.

**Non-Goals:**

- No Unicode normalization, trimming, or automatic repair of unsafe values.
- No changes to production authentication, authorization semantics, protocol routing, capture, input, clipboard, file transfer, installer, startup, service, privilege, or persistence behavior.

## Decisions

- Extend the existing explicit denylist with `0xFEFF` in each current format-control helper.
  - Rationale: the codebase already uses small local helpers and tests around these paths. Adding the missing code point is the smallest compatible change.
  - Alternative considered: introduce a shared package-level helper for all format-control validation. That would reduce duplication, but it is broader than this bug fix and would touch more modules than required.

- Add focused regression cases in existing tests for display-name and token validators.
  - Rationale: the existing tests already cover `U+202E` and `U+200B`; adding `U+FEFF` to those tables proves the gap is closed without creating new test harnesses.
  - Alternative considered: only add protocol tests and rely on shared schema use. That would miss local token helpers in the agent shell and relay.

- Keep error messages generic and unchanged where they already mention zero-width controls.
  - Rationale: callers should learn that the value class is invalid without seeing raw display names or tokens.

## Risks / Trade-offs

- [Risk] Repeated denylist logic can drift again across modules. -> Mitigation: add identical `U+FEFF` test coverage in every affected path and consider a later shared helper refactor after this targeted fix.
- [Risk] Some user-entered values may include a leading BOM from copy/paste. -> Mitigation: fail closed and require explicit correction rather than silently accepting invisible characters in identity or token material.
- [Risk] Token/display-name changes touch security-sensitive relay and token handling. -> Mitigation: run focused tests, full project gates, strict OpenSpec validation, and an explicit security review before release.
