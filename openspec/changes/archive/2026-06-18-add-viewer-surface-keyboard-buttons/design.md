## Context

The loopback viewer local control surface already serves the latest authorized
frame and accepts exact input command strings through the same `/input` endpoint
used by the command box. Keyboard support exists, but common actions require
typing `key-down` and `key-up` commands manually. For an MVP remote-assistance
loop this is cumbersome and encourages operator mistakes.

## Goals / Non-Goals

**Goals:**

- Add visible same-page buttons for a bounded set of common keys.
- Send each button press as exactly one key-down plus one key-up command through
  the existing local mutation endpoint and runtime gates.
- Preserve metadata-only HTTP responses and diagnostics.

**Non-Goals:**

- No document-level keyboard capture.
- No typed-text buffering, macros, hotkeys, clipboard sync, file transfer, or
  diagnostics collection.
- No change to host consent, host visibility, authorization, audit,
  Windows input adapter behavior, relay behavior, or deployment.

## Decisions

- Use buttons instead of global keyboard listeners.
  - Rationale: a click is explicit and visible; document key listeners risk
    becoming keylogging-shaped even when scoped to a local page.
  - Alternative considered: capture keydown/keyup on the page. Rejected for the
    MVP because it is easier to misuse and harder to explain as non-keylogging.

- Reuse the existing `/input` JSON command endpoint.
  - Rationale: this preserves same-origin token validation, bounded body parsing,
    current viewer status checks, runtime permission gates, audit-before-send,
    and redaction behavior.
  - Alternative considered: add a dedicated `/key` endpoint. Rejected because it
    would duplicate validation and increase sensitive-input surface area.

- Keep the key list small and protocol-supported.
  - Rationale: common navigation keys are useful for MVP control without adding
    arbitrary text entry or key capture.

## Risks / Trade-offs

- Operator may expect full keyboard capture -> Mitigation: keep controls
  visibly button-based and retain the command box for advanced explicit
  commands.
- Extra click sends two protocol events -> Mitigation: use the existing
  sequence allocator for each event so ordering remains deterministic.
- Keyboard command failure midway -> Mitigation: each event still passes the
  runtime authorization/audit gates independently and responses stay
  metadata-only.
