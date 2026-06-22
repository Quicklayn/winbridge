## Why

The MVP smoke check already starts host and viewer processes with explicit
local audit-log paths, but it does not verify that consent-bound workflow audit
records were actually persisted. A remote assistance MVP should catch missing
audit persistence before a two-PC trial.

## What Changes

- Make the root MVP smoke check wait for both host and viewer JSONL audit files
  to contain at least one bounded schema-like audit record.
- Add bounded text/JSON success metadata for the audit check and a safe
  `audit-not-ready` failure reason.
- Document that smoke verifies audit persistence without printing raw audit
  contents, audit paths, pairing codes, tokens, or private reasons.

## Impact

- Affected specs: `mvp-session-command-kit`
- Affected code: `scripts/mvp-session-smoke.mjs`,
  `scripts/mvp-session-smoke.test.ts`, `README.md`
- Safety: development-only verification of existing local audit files; no new
  capture, input application, signaling, authorization, browser automation,
  services, persistence, privilege elevation, hidden sessions, or unattended
  behavior.
