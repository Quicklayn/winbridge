## 1. Relay Target Validation

- [x] 1.1 Require a single remaining registered recipient before forwarding registered-peer messages.
- [x] 1.2 Reject explicit target peer ids that do not match the remaining recipient.
- [x] 1.3 Keep missing-recipient and target-mismatch relay errors and audit reasons bounded and secret-safe.

## 2. Integration Coverage

- [x] 2.1 Add relay integration coverage for registered messages without a recipient.
- [x] 2.2 Add relay integration coverage for misaddressed `signal.toPeerId`.
- [x] 2.3 Add relay integration coverage for misaddressed host consent/session authorization decisions.

## 3. Docs, Review, and Verification

- [x] 3.1 Update docs and main specs for registered-recipient targeting.
- [x] 3.2 Run focused relay tests.
- [x] 3.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.4 Complete security review for the relay/targeting/audit diff.
- [x] 3.5 Sync and archive the completed OpenSpec change.
