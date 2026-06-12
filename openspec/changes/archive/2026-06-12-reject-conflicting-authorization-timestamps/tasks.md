## 1. Authorization Schema Validation

- [x] 1.1 Reject conflicting lifecycle timestamps on pending authorization records.
- [x] 1.2 Reject conflicting lifecycle timestamps on approved authorization records.
- [x] 1.3 Reject conflicting lifecycle timestamps on denied authorization records.

## 2. Tests and Documentation

- [x] 2.1 Add focused schema tests for pending, approved, and denied conflicting timestamps.
- [x] 2.2 Document that pre-active and denied authorization records must not carry later lifecycle timestamps.

## 3. Review and Verification

- [x] 3.1 Perform security review for authorization lifecycle metadata validation, confirming no capture, input, hidden session, persistence, credential access, keylogging, token/payload logging, or Windows prompt bypass was introduced.
- [x] 3.2 Run focused authorization tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Archive the completed OpenSpec change after implementation and verification.
