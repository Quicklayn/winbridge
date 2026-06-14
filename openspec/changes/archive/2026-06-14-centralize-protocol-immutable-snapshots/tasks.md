## 1. Shared Helper

- [x] 1.1 Add a dependency-free protocol immutable snapshot helper with the existing recursive freeze semantics.
- [x] 1.2 Update protocol audit, messages, authorization, identity, and session grant code to use the shared helper while preserving output shapes and existing exports.

## 2. Regression Coverage

- [x] 2.1 Add focused tests that prove the helper freezes nested protocol data and representative returned snapshots remain immutable.
- [x] 2.2 Run focused protocol tests and protocol typecheck.

## 3. Review and Validation

- [x] 3.1 Perform security review for auth/log/protocol snapshot impact and confirm no capture, input, relay routing/runtime, installer, startup, service, token, or privilege behavior changed.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Archive the completed OpenSpec change after implementation and verification.
