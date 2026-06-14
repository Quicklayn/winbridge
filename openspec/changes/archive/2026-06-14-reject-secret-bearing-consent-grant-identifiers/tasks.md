## 1. Grant Schema

- [x] 1.1 Add consent-bound grant identifier validation for `sessionId`, `hostPeerId`, `viewerPeerId`, and `auditId`.
- [x] 1.2 Preserve safe non-secret grant identifiers, permission validation, expiration checks, unknown-field rejection, and immutable grant snapshots.

## 2. Tests

- [x] 2.1 Add grant validation tests that reject secret-bearing fixed identifiers without raw value disclosure.
- [x] 2.2 Add remote action authorization tests proving unsafe grant identifiers fail closed before action authorization.
- [x] 2.3 Keep existing grant immutability, malformed identifier, unavailable permission, and safe authorization tests passing.

## 3. Review and Verification

- [x] 3.1 Review authorization/grant behavior for fail-closed semantics, bounded diagnostics, import-cycle risk, and non-capability impact.
- [x] 3.2 Run focused protocol authorization and identity tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Sync and archive the OpenSpec change after implementation is verified.
