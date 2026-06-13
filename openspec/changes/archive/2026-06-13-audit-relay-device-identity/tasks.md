## 1. Relay Audit Metadata

- [x] 1.1 Add bounded device identity detail to accepted relay join audit records after successful registration.
- [x] 1.2 Ensure accepted join audit metadata omits display names, raw pairing codes, tokens, protocol payloads, and remote-content data.

## 2. Tests

- [x] 2.1 Add relay integration coverage for accepted host and viewer joins with device identity metadata.
- [x] 2.2 Add assertions that device identity audit metadata remains non-authorizing and does not change pairing or consent behavior.

## 3. Review And Verification

- [x] 3.1 Run targeted relay tests for accepted join device identity audit behavior.
- [x] 3.2 Run security review for relay/audit/log changes.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Archive the completed OpenSpec change after implementation and verification.
