## 1. Runtime Event Hardening

- [x] 1.1 Add a received-event redaction path so `signal` messages expose routing metadata and redacted payload summary instead of raw payload contents.
- [x] 1.2 Add focused runtime integration coverage proving received signal events omit raw payload strings while preserving signal delivery metadata.

## 2. Documentation and Specs

- [x] 2.1 Update architecture and security documentation to state that received signal runtime events are payload-redacted.
- [x] 2.2 Sync the accepted delta requirement into `openspec/specs/agent-shell-consent-workflow/spec.md`.

## 3. Verification and Review

- [x] 3.1 Run focused agent-shell runtime tests.
- [x] 3.2 Run `npm run check`, `npm test`, `npm run build`, and `npm run openspec:validate`.
- [x] 3.3 Complete security review for the protocol payload event-handling changes.
- [x] 3.4 Archive the completed OpenSpec change after validation.
