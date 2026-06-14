## 1. Relay Delivery Audit

- [x] 1.1 Add post-send `relay.message.delivery` audit for accepted registered-peer forwarding.
- [x] 1.2 Count delivery target, sent, and failed attempts without changing successful protocol envelopes.
- [x] 1.3 Ensure recipient send failure is recorded as delivery failure rather than invalid-message rejection.
- [x] 1.4 Ensure post-send delivery audit failure is sanitized and non-retroactive.

## 2. Regression Coverage

- [x] 2.1 Add relay integration coverage for successful delivery audit metadata.
- [x] 2.2 Add relay integration coverage for failed recipient send outcome.
- [x] 2.3 Add relay integration coverage proving post-send delivery audit failure does not emit `relay.message.rejected` or peer `relay-error`.

## 3. Documentation

- [x] 3.1 Update security documentation to describe accepted-forward audit vs post-send delivery outcome audit.

## 4. Review and Verification

- [x] 4.1 Perform security review for relay routing/logging impact.
- [x] 4.2 Run focused relay integration tests.
- [x] 4.3 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 4.4 Archive the completed OpenSpec change after implementation and verification.
