## 1. Agent Shell Termination Simulation

- [x] 1.1 Add runtime options for host terminate delay and reason.
- [x] 1.2 Schedule termination only after explicit approval and visible active state are sent.
- [x] 1.3 Add CLI flags for development termination simulation.

## 2. Tests and Documentation

- [x] 2.1 Add integration tests for termination control, terminated state, audit-event, secret-safe details, and no terminate without visible activation.
- [x] 2.2 Document the termination simulation flags and development-only scope.

## 3. Review and Verification

- [x] 3.1 Perform security review for consent workflow changes, confirming no capture, input, hidden session, persistence, credential access, keylogging, token/payload logging, or Windows prompt bypass was introduced.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Archive the completed OpenSpec change after implementation and verification.
