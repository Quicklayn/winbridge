## 1. Protocol Validation

- [x] 1.1 Update `SessionControlMessageSchema` to require `reason` for `terminate` while preserving optional reasons for `pause` and `resume`.
- [x] 1.2 Update focused protocol tests for accepted terminate reason, rejected missing terminate reason, and accepted pause/resume without reason.

## 2. Verification

- [x] 2.1 Run the focused protocol message tests.
- [x] 2.2 Run `npm run check`.
- [x] 2.3 Run `npm test`.
- [x] 2.4 Run `npm run build`.
- [x] 2.5 Run `npm run openspec:validate`.
- [x] 2.6 Complete security review for the auth/protocol validation change.
