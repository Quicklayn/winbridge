## 1. Prompt Parsing

- [x] 1.1 Change interactive host consent prompt parsing to accept only exact `approve` or `deny`.
- [x] 1.2 Keep cancelled, EOF, blank, invalid, case-mismatched, and whitespace-padded responses fail-closed as `none`.

## 2. Verification

- [x] 2.1 Add focused prompt tests for whitespace-padded approval and denial responses.
- [x] 2.2 Run focused host consent prompt tests.
- [x] 2.3 Run `npm run verify`.
- [x] 2.4 Perform security review for the host consent prompt parsing change.
- [x] 2.5 Archive the completed OpenSpec change.
