## 1. Implementation

- [x] 1.1 Track host-emitted authorization lifecycle state in the agent shell runtime.
- [x] 1.2 Ignore host inbound `signal` messages before received-event/log emission unless active visible unexpired `screen:view` authorization is tracked.
- [x] 1.3 Keep ignored host inbound signal diagnostics redacted to summary metadata only.
- [x] 1.4 Update architecture, security docs, and the main `agent-shell-consent-workflow` spec with the host inbound signal authorization gate.

## 2. Verification

- [x] 2.1 Add focused integration coverage for pre-authorization ignore, active grant allow, revoke/pause/termination/expiration fail-closed behavior, and secret-safe ignored diagnostics.
- [x] 2.2 Run focused agent-shell runtime integration tests for host inbound signal authorization gating.
- [x] 2.3 Run security review for the authorization/inbound-signal logging diff.
- [x] 2.4 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.5 Validate and archive the completed OpenSpec change.
