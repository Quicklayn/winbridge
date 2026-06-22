## 1. Ready Helper

- [x] 1.1 Add a default `lan-command-plan` readiness step after the localhost `command-plan` step and before optional smoke.
- [x] 1.2 Extend command-plan parsing to optionally verify relay, host, and viewer commands target the fixed LAN relay URL without surfacing generated commands.
- [x] 1.3 Update focused ready tests for order, success, LAN malformed output, and output redaction.

## 2. Documentation And Review

- [x] 2.1 Update README readiness guidance to mention LAN command-plan validation.
- [x] 2.2 Review the change for consent-first safety invariants and confirm it remains non-executing.

## 3. Verification

- [x] 3.1 Run focused `mvp-ready` tests.
- [x] 3.2 Run `npm run check`.
- [x] 3.3 Run `npm test`.
- [x] 3.4 Run `npm run build`.
- [x] 3.5 Run strict OpenSpec validation.
