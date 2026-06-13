## 1. Spec Updates

- [x] 1.1 Update audit-foundation requirements for control/format-control audit metadata rejection.
- [x] 1.2 Update relay runtime requirements for malformed protocol audit-event action rejection.

## 2. Implementation

- [x] 2.1 Harden audit record semantic metadata validation.
- [x] 2.2 Harden protocol `audit-event.action` validation.
- [x] 2.3 Update docs describing audit metadata constraints.

## 3. Regression Tests

- [x] 3.1 Add audit record tests for unsafe action, reason, and target type metadata.
- [x] 3.2 Add protocol audit-event action tests for unsafe metadata and secret-safe diagnostics.
- [x] 3.3 Add relay integration coverage proving malformed audit-event action metadata is rejected before forwarding and without raw metadata leakage.

## 4. Verification And Review

- [x] 4.1 Run focused audit, protocol, and relay tests.
- [x] 4.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.3 Complete security review for audit/log/protocol metadata handling and resolve findings.
- [x] 4.4 Sync implemented requirements into main specs.
- [x] 4.5 Archive the OpenSpec change after implementation and validation.
