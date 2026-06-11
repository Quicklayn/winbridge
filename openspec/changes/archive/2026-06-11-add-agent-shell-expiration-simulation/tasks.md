## 1. Agent Shell Expiration Simulation

- [x] 1.1 Add CLI parsing for `--authorization-ttl-ms`.
- [x] 1.2 Refine host workflow state so revoked, terminated, and expired are terminal for scheduled lifecycle timers.
- [x] 1.3 Schedule expired state and secret-safe audit-event only after visible active state.

## 2. Tests and Documentation

- [x] 2.1 Add integration tests for expiration state, expiration audit-event, no expiration without visible activation, and terminal-state suppression.
- [x] 2.2 Document the TTL flag and development-only expiration simulation scope.

## 3. Review and Verification

- [x] 3.1 Perform security review for consent workflow changes, confirming no capture, input, hidden session, persistence, credential access, keylogging, token/payload logging, or Windows prompt bypass was introduced.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Archive the completed OpenSpec change after implementation and verification.
