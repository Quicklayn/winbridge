## 1. Protocol Authorization

- [x] 1.1 Add `paused` to shared session authorization status schemas and protocol validation.
- [x] 1.2 Implement pause/resume authorization helpers that deny actions while paused and reject unsafe resume paths.
- [x] 1.3 Add focused protocol tests for pause, resume, expired resume, and paused action denial.

## 2. Agent Shell Simulation

- [x] 2.1 Add host pause/resume runtime options and CLI flags.
- [x] 2.2 Send visible-gated pause/resume `session-control`, authorization state, and secret-safe audit-event messages.
- [x] 2.3 Suppress scheduled pause/resume after revoked, terminated, or expired states.
- [x] 2.4 Add integration tests for pause, resume, invisible gating, terminal suppression, and audit redaction.

## 3. Documentation

- [x] 3.1 Document the development pause/resume workflow and safety boundary in README and security/architecture docs.

## 4. Review and Verification

- [x] 4.1 Run security review for authorization and audit/log changes.
- [x] 4.2 Run `npm run check`.
- [x] 4.3 Run `npm test`.
- [x] 4.4 Run `npm run build`.
- [x] 4.5 Run `npm run openspec:validate`.
- [x] 4.6 Archive the completed OpenSpec change and rerun validation.
