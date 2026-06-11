## 1. Runtime Event Sanitization

- [x] 1.1 Update `sendProtocol` to parse/normalize outbound protocol envelopes before socket send and `sent` event emission.
- [x] 1.2 Ensure `sent` events use the normalized envelope and invalid outbound messages emit no `sent` event.

## 2. Verification

- [x] 2.1 Add regression tests for redacted `sent` audit-event details and no event on invalid outbound messages.
- [x] 2.2 Update security/architecture documentation for secret-safe sent runtime events.
- [x] 2.3 Run focused agent-shell runtime tests.
- [x] 2.4 Run `npm run check`.
- [x] 2.5 Run `npm test`.
- [x] 2.6 Run `npm run build`.
- [x] 2.7 Run `npm run openspec:validate`.
- [x] 2.8 Complete a security review for the logging/event and audit secrecy change.
