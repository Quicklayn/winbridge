## 1. Runtime Event Hardening

- [x] 1.1 Add shared local event-view redaction for top-level protocol `reason` fields while preserving wire messages and internal workflow handling.
- [x] 1.2 Add focused runtime integration coverage for outbound and inbound reason-bearing messages proving raw reason text is absent from local events.

## 2. Documentation and Specs

- [x] 2.1 Update architecture and security documentation to state that runtime protocol event reasons are redacted.
- [x] 2.2 Sync the accepted delta requirement into `openspec/specs/agent-shell-consent-workflow/spec.md`.

## 3. Verification and Review

- [x] 3.1 Run focused agent-shell runtime tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete security review for the private reason event-handling changes.
- [x] 3.4 Archive the completed OpenSpec change after validation.
