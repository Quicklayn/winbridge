## 1. Protocol Schema

- [x] 1.1 Add audit-event-only fixed identifier validation for `messageId`, `sessionId`, `eventId`, and `actorPeerId`.
- [x] 1.2 Preserve safe non-secret audit-event identifiers, detail redaction, action validation, and immutable parsed envelopes.

## 2. Tests

- [x] 2.1 Add protocol tests that parse and encode reject secret-bearing audit-event fixed identifiers without raw value disclosure.
- [x] 2.2 Keep existing audit-event detail redaction, action validation, and safe identifier tests passing.

## 3. Review and Verification

- [x] 3.1 Review protocol/logging behavior for secret leakage, bounded diagnostics, relay forwarding impact, and non-authorization impact.
- [x] 3.2 Run focused protocol message tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Sync and archive the OpenSpec change after implementation is verified.
