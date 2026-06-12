## Context

The interactive host prompt is a development-only consent path. It must be simple enough that accidental input cannot be interpreted as consent. The prompt currently calls `trim()` before comparing the answer to `approve` or `deny`, which accepts padded variants.

## Goals / Non-Goals

**Goals:**

- Make prompt answer parsing exact for `approve` and `deny`.
- Keep EOF, cancellation, blank input, padded input, and invalid input fail-closed as `none`.
- Preserve existing prompt text and secret-safe logging.

**Non-Goals:**

- No native UI, localization, fuzzy matching, default choices, or timeout behavior.
- No protocol or relay changes.

## Decisions

1. Compare the raw `readline.question()` answer directly against `approve` and `deny`.
   - Rationale: exact matching is easiest to audit and matches the documented consent wording.
   - Alternative considered: trim only trailing carriage returns or spaces. Rejected because `readline.question()` already returns the line without the newline, and any extra whitespace should not count as explicit consent.

## Risks / Trade-offs

- [Risk] Operators may type accidental spaces and get a fail-closed no-op. -> Mitigation: this is safer than interpreting ambiguous input as consent, and the prompt remains explicit about accepted words.
