## 1. Implementation

- [x] 1.1 Add an inbound signal peer-boundary guard in the agent shell runtime before local `received` events and signal summary logging.
- [x] 1.2 Keep ignored signal diagnostics redacted to summary metadata only.
- [x] 1.3 Update docs and the main `agent-shell-consent-workflow` spec with the signal peer boundary.

## 2. Verification

- [x] 2.1 Add focused integration coverage for misdirected and self-origin inbound `signal` messages.
- [x] 2.2 Run the focused agent-shell runtime integration test.
- [x] 2.3 Run security review for the signal/logging diff.
- [x] 2.4 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 2.5 Validate and archive the completed OpenSpec change.
