## 1. Agent Shell Revoke Simulation

- [x] 1.1 Add runtime options for host revoke delay, permission, and reason.
- [x] 1.2 Schedule revoke only after an explicit approval and visible active state are sent.
- [x] 1.3 Add CLI flags for development revoke simulation.

## 2. Tests and Documentation

- [x] 2.1 Add integration tests for full revoke, partial revoke, and no revoke without visible activation.
- [x] 2.2 Document the revoke simulation flags and development-only scope.

## 3. Review and Verification

- [x] 3.1 Perform security review for consent workflow changes, confirming no capture, input, hidden session, persistence, credential access, keylogging, token/payload logging, or Windows prompt bypass was introduced.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Archive the completed OpenSpec change after implementation and verification.
