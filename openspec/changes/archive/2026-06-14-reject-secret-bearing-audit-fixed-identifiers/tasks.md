## 1. Audit Schema

- [x] 1.1 Add shared audit identifier validation for `eventId`, `actor.id`, `sessionId`, and `target.id`.
- [x] 1.2 Preserve safe non-secret fixed audit identifiers and existing audit detail redaction behavior.

## 2. Tests

- [x] 2.1 Add protocol audit tests for secret-bearing fixed identifier rejection without raw value disclosure.
- [x] 2.2 Keep existing malformed identifier and safe audit record tests passing.

## 3. Review and Verification

- [x] 3.1 Review audit/logging behavior for secret leakage, bounded diagnostics, relay compatibility, and non-authorization impact.
- [x] 3.2 Run focused protocol audit tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Sync and archive the OpenSpec change after implementation is verified.
