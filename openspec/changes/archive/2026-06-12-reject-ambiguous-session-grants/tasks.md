## 1. Protocol Validation

- [x] 1.1 Reject empty permission lists in `SessionGrantSchema`.
- [x] 1.2 Reject duplicate permission entries in `SessionGrantSchema`.

## 2. Tests and Documentation

- [x] 2.1 Add focused tests for empty and duplicate session grant scopes.
- [x] 2.2 Document that consent-bound session grants require non-empty unique permission scopes.

## 3. Review and Verification

- [x] 3.1 Perform security review for session grant validation, confirming no capture, input, hidden session, persistence, credential access, keylogging, token/payload logging, or Windows prompt bypass was introduced.
- [x] 3.2 Run focused protocol tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Archive the completed OpenSpec change after implementation and verification.
