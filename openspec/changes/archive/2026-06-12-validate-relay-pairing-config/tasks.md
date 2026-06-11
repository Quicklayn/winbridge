## 1. Pairing Config Validation

- [x] 1.1 Add tests for omitted pairing defaults, exact valid env values, malformed env values, and out-of-range env values.
- [x] 1.2 Add tests for unsafe injected relay pairing settings through runtime and room registry construction.
- [x] 1.3 Implement exact bounded integer parsing for pairing TTL and max-use env values.
- [x] 1.4 Implement shared validation for injected relay pairing settings before ticket creation.
- [x] 1.5 Update README and security documentation to describe bounded pairing configuration.

## 2. Verification

- [x] 2.1 Run focused relay pairing configuration tests.
- [x] 2.2 Run `npm run check`.
- [x] 2.3 Run `npm test`.
- [x] 2.4 Run `npm run build`.
- [x] 2.5 Run `npm run openspec:validate`.
- [x] 2.6 Run security review for relay pairing configuration changes.
- [x] 2.7 Archive the OpenSpec change after implementation and verification are complete.
