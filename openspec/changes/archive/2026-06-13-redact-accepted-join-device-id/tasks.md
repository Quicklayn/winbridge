## 1. Relay Accepted Audit Redaction

- [x] 1.1 Redact accepted join `deviceIdentity.deviceId` when it contains the submitted pairing code.
- [x] 1.2 Preserve safe accepted identity metadata and non-authorizing behavior.

## 2. Tests

- [x] 2.1 Add relay integration coverage for accepted host joins with device ids containing pairing codes.
- [x] 2.2 Add relay integration coverage for accepted viewer joins with device ids containing pairing codes.

## 3. Review And Verification

- [x] 3.1 Run targeted relay tests for accepted join device id redaction.
- [x] 3.2 Run security review for relay/audit/log changes.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Archive the completed OpenSpec change after implementation and verification.
