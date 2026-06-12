## 1. Protocol Validation

- [x] 1.1 Add non-blank validation for hello capability entries while preserving existing bounds.
- [x] 1.2 Reject duplicate hello capability entries without trimming or normalizing values.

## 2. Tests and Documentation

- [x] 2.1 Add focused protocol tests for blank and duplicate hello capability rejection.
- [x] 2.2 Document that hello capabilities are bounded unique metadata hints and not authorization.

## 3. Review and Verification

- [x] 3.1 Perform security review for hello metadata validation, confirming no capture, input, hidden session, persistence, credential access, keylogging, token/payload logging, or Windows prompt bypass was introduced.
- [x] 3.2 Run focused protocol tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Archive the completed OpenSpec change after implementation and verification.
