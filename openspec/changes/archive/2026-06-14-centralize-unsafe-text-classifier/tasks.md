## 1. Shared Helper

- [x] 1.1 Add a dependency-free protocol text-safety helper for ASCII control and Unicode bidi/zero-width formatting controls.
- [x] 1.2 Update protocol audit, messages, authorization, and identity validation to use the shared helper while preserving existing field-specific diagnostics.

## 2. Regression Coverage

- [x] 2.1 Add focused tests that prove representative protected schema paths reject unsafe text through the shared helper and preserve safe text behavior.
- [x] 2.2 Run focused protocol tests and protocol typecheck.

## 3. Review and Validation

- [x] 3.1 Perform security review for auth/log/protocol metadata validation impact and confirm no capture, input, relay routing/runtime, installer, startup, service, token, or privilege behavior changed.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Archive the completed OpenSpec change after implementation and verification.
