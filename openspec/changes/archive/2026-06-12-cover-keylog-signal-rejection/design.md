## Context

WinBridge treats `signal.payload` as untrusted signaling metadata. The schema rejects payload keys that indicate sensitive remote-assistance content before the relay or agent shell can forward or trust the data. The code already blocks `keylog` by substring, but `keylogger` is not listed explicitly and the specs/tests only mention `keystroke` for keyboard-content style payloads.

## Goals / Non-Goals

**Goals:**

- Explicitly list `keylog` and `keylogger` as sensitive signal payload key indicators.
- Cover direct, decorated, nested, and array keylogging-related keys in protocol tests.
- Cover relay rejection with audit redaction/omission expectations so raw keylogging markers are not forwarded or persisted.
- Keep `authorizationId` permitted as non-secret lifecycle metadata.

**Non-Goals:**

- No keylogging, keyboard capture, input capture, screen capture, clipboard, file transfer, or diagnostics implementation.
- No relay routing changes beyond schema-invalid rejection coverage.
- No installer, startup, service, persistence, privilege, token, or native Windows API changes.
- No broad rewrite of the signal payload validation model.

## Decisions

- Add `keylogger` to `SENSITIVE_SIGNAL_PAYLOAD_KEY_INDICATORS` even though `keylog` already matches it by substring.
  - Rationale: explicit vocabulary makes the prohibited class clear and keeps code aligned with specs.
  - Alternative considered: rely on existing `keylog` substring only. That keeps behavior but leaves the contract under-specified.

- Use existing recursive sensitive-key detection rather than a new validator.
  - Rationale: the existing path finder already checks nested objects and arrays and returns a precise offending path for one issue.
  - Alternative considered: special-case keylogging fields separately. That would duplicate logic without improving safety.

- Add both protocol unit tests and relay integration tests.
  - Rationale: protocol tests prove schema behavior; relay tests prove rejected payloads are not forwarded and audit records remain secret-safe.

## Risks / Trade-offs

- The new explicit indicator is redundant with `keylog` substring matching -> acceptable for readability and future-proofing.
- Some benign application-defined metadata containing `keylog` / `keylogger` in a key will be rejected -> intentional fail-closed behavior because keylogging is prohibited.
- Relay integration coverage adds a small amount of test runtime -> acceptable for a safety boundary.
